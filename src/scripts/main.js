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

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa o smooth scroll com Lenis + GSAP (fixando no topo)
  initSmoothScroll();

  // 2. Inicializa o cursor magnético e fluido
  initCustomCursor();

  // 3. Inicializa o Shader GLSL Three.js na Hero
  initThreeHero();

  // 4. Dispara a transição de abertura (fresta -> imagem completa) e entrada monumental
  initKineticHero();

  // 5. Configura as micro-interações dos projetos e ScrollTrigger
  initProjectsInteractions();

  console.log('%c STRUCTA STUDIES // GLSL KINETIC SHADER INITIALIZED ', 'background: #080a0d; color: #f59e0b; font-weight: bold; padding: 4px 8px; border: 1px solid #e08726;');
});
