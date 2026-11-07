if (typeof window !== 'undefined') {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
}

import { initSmoothScroll } from './smooth-scroll.js';
import { initCustomCursor } from './cursor.js';
import { initThreeHero } from './three-hero.js';
import { initKineticHero } from './kinetic-hero.js';
import { initProjectsInteractions } from './projects-hover.js';

function bootstrap() {
  // 1. Inicializa o smooth scroll com Lenis + GSAP (fixando no topo com precisão)
  initSmoothScroll();

  // 2. Inicializa o cursor magnético e fluido
  initCustomCursor();

  // 3. Configura as micro-interações dos projetos e ScrollTrigger
  initProjectsInteractions();

  // 4. Inicializa o Shader GLSL Three.js na Hero
  const threeHero = initThreeHero();

  // 5. Orquestra a transição de abertura (fresta -> revelação monumental)
  // Aguarda a textura estar pronta no WebGL para que a abertura aconteça sobre a obra real,
  // eliminando qualquer tela preta ou atraso no refresh
  let kineticStarted = false;
  const startKinetic = () => {
    if (!kineticStarted) {
      kineticStarted = true;
      initKineticHero();
    }
  };

  if (threeHero && threeHero.readyPromise) {
    threeHero.readyPromise.then(startKinetic);
  } else {
    startKinetic();
  }

  // Fallback de segurança absoluto: nunca retarda a entrada por mais de 300ms
  setTimeout(startKinetic, 300);

  console.log('%c STRUCTA STUDIES // GLSL KINETIC SHADER INITIALIZED ', 'background: #080a0d; color: #f59e0b; font-weight: bold; padding: 4px 8px; border: 1px solid #e08726;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
