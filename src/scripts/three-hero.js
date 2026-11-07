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

  // Cancela animação anterior se houver re-inicialização
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (renderer) {
    try {
      renderer.dispose();
    } catch (e) {}
  }

  // 1. Setup do Renderer WebGL com proteção e detecção de contexto
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
  } catch (err) {
    console.warn('WebGL initialization failed, using native image fallback:', err);
    return null;
  }

  const isMobile = window.innerWidth <= 768;
  const maxPixelRatio = isMobile ? 1.5 : 2; // Otimizado para GPUs móveis (ex: Adreno 610)

  const getContainerDimensions = () => {
    const rect = heroContainer.getBoundingClientRect();
    const width = Math.round(rect.width || window.innerWidth);
    const height = Math.round(rect.height || window.innerHeight);
    return { width, height };
  };

  const { width: initialWidth, height: initialHeight } = getContainerDimensions();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.setSize(initialWidth, initialHeight, false);

  // 2. Cena e Câmera Ortográfica (Quad Fullscreen)
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // 3. Texturas: Reutiliza diretamente a imagem nativa do DOM eliminando conflitos de CORS e Preload
  let resolveReady = null;
  let isReady = false;

  const readyPromise = new Promise((resolve) => {
    resolveReady = () => {
      if (!isReady) {
        isReady = true;
        resolve();
      }
    };
  });

  const fallbackImg = document.getElementById('heroFallbackImg');
  let baseTexture;

  if (fallbackImg && fallbackImg.complete && fallbackImg.naturalWidth > 0) {
    baseTexture = new THREE.Texture(fallbackImg);
    baseTexture.generateMipmaps = false;
    baseTexture.minFilter = THREE.LinearFilter;
    baseTexture.magFilter = THREE.LinearFilter;
    baseTexture.needsUpdate = true;
    resolveReady();
  } else if (fallbackImg) {
    baseTexture = new THREE.Texture(fallbackImg);
    baseTexture.generateMipmaps = false;
    baseTexture.minFilter = THREE.LinearFilter;
    baseTexture.magFilter = THREE.LinearFilter;

    fallbackImg.addEventListener('load', () => {
      baseTexture.needsUpdate = true;
      if (material) {
        material.uniforms.uImageResolution.value.set(
          fallbackImg.naturalWidth || 2752,
          fallbackImg.naturalHeight || 1536
        );
      }
      resolveReady();
    }, { once: true });

    fallbackImg.addEventListener('error', () => {
      resolveReady();
    }, { once: true });
  } else {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    baseTexture = textureLoader.load('/hero.jpg', () => {
      resolveReady();
    }, undefined, () => {
      resolveReady();
    });
    baseTexture.generateMipmaps = false;
    baseTexture.minFilter = THREE.LinearFilter;
    baseTexture.magFilter = THREE.LinearFilter;
  }

  // Timeout de segurança: nunca bloqueia a página por mais de 250ms
  setTimeout(() => {
    if (resolveReady) resolveReady();
  }, 250);

  // Mapa de profundidade sintético de alta precisão
  const depthTexture = createSyntheticDepthTexture();

  // Dimensões iniciais da imagem
  const initialImgW = (fallbackImg && fallbackImg.naturalWidth) ? fallbackImg.naturalWidth : 2752;
  const initialImgH = (fallbackImg && fallbackImg.naturalHeight) ? fallbackImg.naturalHeight : 1536;

  // 4. Shader Material com Uniforms Calibráveis
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: baseTexture },
      uDepthMap: { value: depthTexture },
      uResolution: {
        value: new THREE.Vector2(initialWidth, initialHeight),
      },
      uImageResolution: { value: new THREE.Vector2(initialImgW, initialImgH) },
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
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      // Normalizado de -1.0 a +1.0 com clamping estrito para evitar distorção fora da hero
      const rawX = (x - 0.5) * 2.0;
      const rawY = (0.5 - y) * 2.0;
      mouseTarget.x = Math.max(-1.0, Math.min(1.0, rawX));
      mouseTarget.y = Math.max(-1.0, Math.min(1.0, rawY));
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouseTarget.x = 0;
      mouseTarget.y = 0;
    }, { passive: true });
  }

  // 6. Resize Handler Preciso sem distorção
  function onResize() {
    if (!heroContainer || !renderer || !material) return;
    const { width, height } = getContainerDimensions();

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    material.uniforms.uResolution.value.set(width, height);
  }
  window.addEventListener('resize', onResize);

  // 7. Render Loop Otimizado para 60fps com pausa em background
  const clock = new THREE.Clock();

  function render() {
    animationFrameId = requestAnimationFrame(render);

    if (document.hidden) return; // Economia de bateria quando em segundo plano no celular

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

  // Tratamento de Perda de Contexto WebGL em dispositivos móveis
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    console.warn('WebGL context lost, maintaining native fallback');
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    onResize();
  }, false);

  return {
    material,
    onResize,
    readyPromise,
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
    duration: 1.8,
    ease: 'power3.inOut',
  }, 0.0);

  return targetTimeline;
}
