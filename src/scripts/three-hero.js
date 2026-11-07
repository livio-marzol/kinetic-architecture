import * as THREE from 'three';
import gsap from 'gsap';
import { vertexShader } from './shaders/hero-vertex.js';
import { fragmentShader } from './shaders/hero-fragment.js';
import { createSyntheticDepthTexture } from './depth-generator.js';

let renderer = null;
let scene = null;
let camera = null;
let material = null;
let heroContainer = null;
let animationFrameId = null;

// Estados de interpolação do mouse (lerp com inércia 0.05)
let mouseTarget = { x: 0, y: 0 };
let mouseCurrent = { x: 0, y: 0 };

export function initThreeHero() {
  const canvas = document.getElementById('heroCanvas');
  heroContainer = document.getElementById('hero');

  if (!canvas || !heroContainer) return null;

  // 1. Setup do Renderer WebGL
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(heroContainer.clientWidth, heroContainer.clientHeight);

  // 2. Cena e Câmera Ortográfica (Quad Fullscreen)
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // 3. Texturas: Imagem da Fachada + Mapa de Profundidade
  const textureLoader = new THREE.TextureLoader();
  const baseTexture = textureLoader.load('/hero.jpg', (tex) => {
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    if (material && tex.image) {
      material.uniforms.uImageResolution.value.set(tex.image.width, tex.image.height);
    }
  });

  // Mapa de profundidade sintético de alta precisão
  const depthTexture = createSyntheticDepthTexture();

  // 4. Shader Material com Uniforms Calibráveis
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: baseTexture },
      uDepthMap: { value: depthTexture },
      uResolution: {
        value: new THREE.Vector2(heroContainer.clientWidth, heroContainer.clientHeight),
      },
      uImageResolution: { value: new THREE.Vector2(2048, 1152) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uProgress: { value: 0.0 }, // Inicia em 0.0 (fresta vertical fechada)
      uTime: { value: 0.0 },

      // ==========================================
      // VARIÁVEIS DE CALIBRAÇÃO (Conforme briefing)
      // ==========================================
      uDepthIntensity: { value: 0.038 },       // Intensidade do Parallax 2.5D
      uChromaticAberration: { value: 0.0032 },  // Dispersão óptica / RGB shift
      uLouverSpeed: { value: 2.2 },            // Velocidade dos brises cinéticos
      uAmberColor: { value: new THREE.Color('#f59e0b') }, // Brilho âmbar de corte
    },
    depthTest: false,
    depthWrite: false,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // 5. Escuta de Movimento do Mouse com Normalização (-1 a 1)
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (!isTouchDevice) {
    window.addEventListener('mousemove', (e) => {
      const rect = heroContainer.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Normalizado de -1.0 a +1.0
      mouseTarget.x = (x - 0.5) * 2.0;
      mouseTarget.y = (0.5 - y) * 2.0;
    });

    window.addEventListener('mouseleave', () => {
      mouseTarget.x = 0;
      mouseTarget.y = 0;
    });
  }

  // 6. Resize Handler com Aspect Ratio Cover
  function onResize() {
    if (!heroContainer || !renderer || !material) return;
    const width = heroContainer.clientWidth;
    const height = heroContainer.clientHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    material.uniforms.uResolution.value.set(width, height);
  }
  window.addEventListener('resize', onResize);

  // 7. Render Loop Otimizado para 60fps
  const clock = new THREE.Clock();

  function render() {
    animationFrameId = requestAnimationFrame(render);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (material) {
      material.uniforms.uTime.value = elapsedTime;

      // Interpolação do mouse com inércia lerp 0.05
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.05;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.05;
      material.uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);
    }

    renderer.render(scene, camera);
  }
  render();

  return {
    material,
    onResize,
  };
}

/**
 * Orquestra a transição de abertura cinematográfica:
 * Transiciona uProgress de 0.0 (fresta vertical estreita) para 1.0 (imagem completa da fachada)
 */
export function animateShaderEntrance(timeline) {
  if (!material) return;

  // Garante estado inicial na fresta vertical estreita
  material.uniforms.uProgress.value = 0.0;

  const targetTimeline = timeline || gsap.timeline();

  targetTimeline.to(material.uniforms.uProgress, {
    value: 1.0,
    duration: 2.2,
    ease: 'expo.out', // Transição arquitetônica fluida e precisa
    onUpdate: () => {
      if (material) {
        // Notifica o renderer se necessário
      }
    },
  }, 0.1);

  return targetTimeline;
}
