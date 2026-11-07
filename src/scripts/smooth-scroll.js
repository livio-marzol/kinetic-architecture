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

let tickerCallback = null;

export function initSmoothScroll() {
  window.scrollTo(0, 0);

  if (lenis) {
    try {
      lenis.destroy();
    } catch (e) {}
    lenis = null;
  }
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }

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

  tickerCallback = (time) => {
    if (lenis) lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);
  // Mantém lagSmoothing ativo para absorver spikes de carga de texturas WebGL sem saltar frames
  gsap.ticker.lagSmoothing(500, 33);

  // Sincronização pós-render
  requestAnimationFrame(() => {
    if (lenis) {
      lenis.resize();
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

  // Reforço de alinhamento de layout no evento load e pageshow (após imagens e fontes estarem 100% calculadas)
  const syncLayout = () => {
    if (lenis) {
      lenis.resize();
    }
    ScrollTrigger.refresh();
  };

  window.addEventListener('load', syncLayout);
  window.addEventListener('pageshow', syncLayout);
  setTimeout(syncLayout, 350);

  return lenis;
}

export function getLenis() {
  return lenis;
}
