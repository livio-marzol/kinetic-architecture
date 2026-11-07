import * as THREE from 'three';

/**
 * Gera um mapa de profundidade sintético em alta resolução calibrado
 * para a fachada de concreto drapeado e auditório de vidro da Structa Studies.
 * Branco = Marquise frontal de concreto (Z máximo)
 * Cinza médio = Brises verticais e interior iluminado (Z intermediário)
 * Preto/Escuro = Céu enevoado e fundo profundo (Z mínimo)
 */
export function createSyntheticDepthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.Texture();

  // 1. Fundo base: Atmosfera/névoa escura (profundidade distante)
  ctx.fillStyle = '#181818';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Esplanada de concreto molhado em primeiro plano (gradiente de baixo para o centro)
  const groundGrad = ctx.createLinearGradient(0, 1024, 0, 680);
  groundGrad.addColorStop(0.0, '#E8E8E8'); // Próximo da câmera (branco)
  groundGrad.addColorStop(0.4, '#B0B0B0');
  groundGrad.addColorStop(0.8, '#707070');
  groundGrad.addColorStop(1.0, '#383838');
  ctx.fillStyle = groundGrad;
  ctx.beginPath();
  ctx.moveTo(0, 680);
  ctx.lineTo(1024, 680);
  ctx.lineTo(1024, 1024);
  ctx.lineTo(0, 1024);
  ctx.closePath();
  ctx.fill();

  // 3. Bloco do Auditório Central e Brises de Madeira (Zona Intermediária)
  const louverGrad = ctx.createLinearGradient(0, 360, 0, 720);
  louverGrad.addColorStop(0.0, '#787878');
  louverGrad.addColorStop(0.5, '#929292');
  louverGrad.addColorStop(1.0, '#656565');
  ctx.fillStyle = louverGrad;
  ctx.beginPath();
  ctx.rect(220, 340, 584, 380);
  ctx.fill();

  // 4. Asas e Marquise de Concreto Esculpido / Drapeado Frontal (Primeiro plano Z alto)
  // Asa Esquerda
  ctx.fillStyle = '#E5E5E5';
  ctx.beginPath();
  ctx.moveTo(40, 240);
  ctx.bezierCurveTo(120, 240, 260, 340, 280, 520);
  ctx.bezierCurveTo(290, 620, 270, 740, 250, 780);
  ctx.bezierCurveTo(220, 780, 180, 700, 180, 620);
  ctx.bezierCurveTo(180, 480, 80, 320, 40, 240);
  ctx.fill();

  // Asa Direita (Draped concrete folds)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(980, 260);
  ctx.bezierCurveTo(880, 260, 720, 360, 730, 560);
  ctx.bezierCurveTo(740, 680, 770, 760, 760, 790);
  ctx.bezierCurveTo(720, 790, 680, 660, 690, 540);
  ctx.bezierCurveTo(710, 400, 860, 310, 980, 260);
  ctx.fill();

  // Cobertura Superior Ondulada Frontal (Marquise suspensa)
  const canopyGrad = ctx.createLinearGradient(0, 220, 0, 440);
  canopyGrad.addColorStop(0.0, '#F5F5F5');
  canopyGrad.addColorStop(0.5, '#E2E2E2');
  canopyGrad.addColorStop(1.0, '#ACACAC');
  ctx.fillStyle = canopyGrad;

  ctx.beginPath();
  ctx.moveTo(40, 240);
  ctx.bezierCurveTo(300, 230, 450, 320, 512, 340);
  ctx.bezierCurveTo(620, 360, 850, 250, 980, 260);
  ctx.bezierCurveTo(880, 340, 750, 430, 512, 450);
  ctx.bezierCurveTo(340, 430, 180, 350, 40, 240);
  ctx.fill();

  // 5. Suavização Gaussiana para transições naturais de relevo 2.5D
  ctx.filter = 'blur(18px)';
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  return texture;
}
