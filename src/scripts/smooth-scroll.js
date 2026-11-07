import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

// Bloqueio rigoroso de restauração de scroll do navegador
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });
}

export function initSmoothScroll() {
  window.scrollTo(0, 0);

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.8,
    infinite: false,
  });

  // Força posição 0 imediata
  lenis.scrollTo(0, { immediate: true, force: true });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Garantir que após os renders o scroll continue 0
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    ScrollTrigger.refresh();
  });

  // Manipular links âncora para scroll suave SEM mudar o hash da URL
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          if (targetId === '#hero') {
            lenis.scrollTo(0, {
              duration: 1.4,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            return;
          }

          lenis.scrollTo(targetElement, {
            offset: 0,
            duration: 1.3,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    });
  });

  // Botão Apex (Back to top)
  const backTopBtn = document.getElementById('btnBackTop');
  if (backTopBtn) {
    backTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(0, {
        duration: 1.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    });
  }

  // Reforço duplo no evento load
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
  });

  return lenis;
}

export function getLenis() {
  return lenis;
}
