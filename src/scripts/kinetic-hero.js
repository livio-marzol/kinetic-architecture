import gsap from 'gsap';
import { animateShaderEntrance } from './three-hero.js';

export function initKineticHero() {
  const heroSection = document.getElementById('hero');
  const titles = document.querySelectorAll('.hero-title');
  const header = document.getElementById('siteHeader');
  const metaBar = document.querySelector('.hero-meta-bar');
  const statement = document.querySelector('.hero-statement');
  const scrollCta = document.getElementById('scrollCta');

  if (!heroSection) return;

  // Estados iniciais antes da revelação garantidos via GSAP
  gsap.set(header, {
    y: -50,
    opacity: 0,
  });

  gsap.set(titles, {
    y: '100%',
    opacity: 0,
  });

  gsap.set([metaBar, statement, scrollCta], {
    y: 20,
    opacity: 0,
  });

  // Remove a classe de proteção contra FOUC com segurança agora que o GSAP assumiu o controle
  document.documentElement.classList.remove('is-loading');

  // Timeline Cinética Monumental de Abertura
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
  });

  // 1. Transição do Shader Three.js: Abertura progressiva da fresta vertical mecânica (uProgress 0.0 -> 1.0)
  animateShaderEntrance(tl);

  // 2. Tipografia monumental surge em sincronia com a expansão da luz
  tl.to(titles, {
    y: '0%',
    opacity: 1,
    duration: 1.3,
    stagger: 0.12,
    ease: 'power4.out',
  }, 0.35)

  // 3. Metadados técnicos e header entram suavemente
  .to(header, {
    y: 0,
    opacity: 1,
    duration: 1.0,
    ease: 'power3.out',
  }, 0.6)
  .to([metaBar, statement, scrollCta], {
    y: 0,
    opacity: 1,
    duration: 1.0,
    stagger: 0.08,
    ease: 'power3.out',
  }, 0.7);
}
