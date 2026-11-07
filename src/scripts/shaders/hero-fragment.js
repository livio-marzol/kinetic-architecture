export const fragmentShader = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uTexture;
uniform sampler2D uDepthMap;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform vec2 uMouse;
uniform float uProgress;
uniform float uTime;

// ==========================================
// VARIÁVEIS DE CALIBRAÇÃO CINÉTICA
// ==========================================
uniform float uDepthIntensity;        // Intensidade do Parallax 2.5D (padrão: 0.038)
uniform float uChromaticAberration;   // Dispersão óptica / RGB shift (padrão: 0.0032)
uniform float uLouverSpeed;           // Velocidade angular dos brises dinâmicos (padrão: 2.2)
uniform vec3 uAmberColor;             // Luz âmbar do obturador (vec3(0.96, 0.62, 0.18))

varying vec2 vUv;

// Função para preservar proporção 'cover' (aspect ratio) da imagem na tela
vec2 getCoverUv(vec2 uv, vec2 screenRes, vec2 imgRes) {
  float screenAspect = screenRes.x / screenRes.y;
  float imgAspect = imgRes.x / imgRes.y;
  vec2 newUv = uv;
  if (screenAspect > imgAspect) {
    float scale = screenAspect / imgAspect;
    newUv.y = (newUv.y - 0.5) / scale + 0.5;
  } else {
    float scale = imgAspect / screenAspect;
    newUv.x = (newUv.x - 0.5) / scale + 0.5;
  }
  return newUv;
}

void main() {
  // 1. Coordenadas com proporção cover
  vec2 coverUv = getCoverUv(vUv, uResolution, uImageResolution);

  // 2. Leitura do Mapa de Profundidade
  float depth = texture2D(uDepthMap, coverUv).r;

  // 3. Parallax 2.5D com Inércia
  // Deslocamento relativo ponderado pelo mapa de profundidade
  vec2 parallax = uMouse * (depth - 0.5) * uDepthIntensity;
  vec2 displacedUv = coverUv + parallax;

  // 4. Micro-movimento Cinético dos Brises (Kinetic Louvers)
  // Isola a faixa intermediária de profundidade (brises de madeira e luz âmbar central)
  float louverMask = smoothstep(0.30, 0.46, depth) * (1.0 - smoothstep(0.66, 0.82, depth));
  float louverWave = sin(coverUv.y * 115.0 + uTime * uLouverSpeed + uMouse.x * 5.5) * cos(coverUv.x * 40.0);
  displacedUv.x += louverWave * louverMask * 0.0028;

  // 5. Aberração Cromática Sutil (RGB Shift)
  // Dispersão óptica baseada na intensidade do vetor cinético
  float motionMag = length(parallax) * 22.0 + abs(louverWave) * louverMask * 0.8;
  vec2 shiftDir = length(parallax) > 0.0001 ? normalize(parallax) : vec2(1.0, 0.0);
  vec2 chromaticOffset = shiftDir * (uChromaticAberration * (0.35 + motionMag * 0.65));

  float r = texture2D(uTexture, displacedUv + chromaticOffset).r;
  float g = texture2D(uTexture, displacedUv).g;
  float b = texture2D(uTexture, displacedUv - chromaticOffset).b;
  vec3 texColor = vec3(r, g, b);

  // 6. Transição de Entrada: Fresta Vertical -> Composição Aberta
  // uProgress = 0.0 (fresta estreita no centro) -> uProgress = 1.0 (imagem 100% aberta)
  float normalizedX = vUv.x;
  float distFromCenter = abs(normalizedX - 0.5);

  // Abertura mecânica do obturador: de fresta mínima (0.02) até 0.53 (cobrindo a tela inteira com folga)
  float halfAperture = mix(0.02, 0.53, uProgress);
  float edgeSoftness = mix(0.012, 0.002, uProgress);

  // Máscara da fresta arquitetônica (1.0 - smoothstep garante GLSL válido edge0 < edge1 sem undefined behavior)
  float slitMask = 1.0 - smoothstep(halfAperture - edgeSoftness, halfAperture + edgeSoftness, distFromCenter);

  // Brilho Âmbar (Light Leak) nas bordas de corte mecânico
  float edgeDist = abs(distFromCenter - halfAperture);
  float lightLeak = exp(-edgeDist * 48.0) * (1.0 - uProgress * 0.78);
  vec3 amberGlow = uAmberColor * lightLeak * 1.5;

  // Desfoque direcional horizontal sutil perto das bordas durante a abertura (edge0 < edge1 rigoroso)
  float motionBlurEdge = (1.0 - smoothstep(0.0, 0.045, edgeDist)) * (1.0 - uProgress) * 0.38;
  vec3 blurredSample = (
    texture2D(uTexture, displacedUv + vec2(0.0035 * (1.0 - uProgress), 0.0)).rgb +
    texture2D(uTexture, displacedUv - vec2(0.0035 * (1.0 - uProgress), 0.0)).rgb
  ) * 0.5;

  vec3 finalColor = mix(texColor, blurredSample, motionBlurEdge);
  finalColor += amberGlow;

  // Fundo arquitetônico escuro (#080A0D) fora da fresta
  vec3 darkBackdrop = vec3(0.031, 0.039, 0.051);
  vec3 composite = mix(darkBackdrop, finalColor, slitMask);

  // Vinheta sutil e gradação atmosférica
  float vignette = 1.0 - smoothstep(0.45, 0.98, length(vUv - 0.5));
  composite *= mix(0.88, 1.0, vignette);

  gl_FragColor = vec4(composite, 1.0);
}
`;
