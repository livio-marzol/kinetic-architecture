import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initProjectsInteractions() {
  const floatingPreview = document.getElementById('floatingPreview');
  const previewImg = document.getElementById('floatingPreviewImg');
  const projectItems = document.querySelectorAll('.project-item');

  if (projectItems.length === 0) return;

  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  // Preview flutuante ativo somente em dispositivos que possuem mouse/cursor
  if (!isTouchDevice && floatingPreview && previewImg) {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isHovering = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateFloatingPosition() {
      if (isHovering) {
        targetX += (mouseX - targetX) * 0.15;
        targetY += (mouseY - targetY) * 0.15;
        floatingPreview.style.left = `${targetX + 40}px`;
        floatingPreview.style.top = `${targetY - 80}px`;
      }
      requestAnimationFrame(updateFloatingPosition);
    }
    requestAnimationFrame(updateFloatingPosition);

    projectItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        const imgSrc = item.getAttribute('data-preview');
        if (imgSrc) {
          previewImg.src = imgSrc;
          isHovering = true;
          floatingPreview.style.opacity = '1';
          floatingPreview.style.transform = 'translate(-50%, -50%) scale(1)';
        }
      });

      item.addEventListener('mouseleave', () => {
        isHovering = false;
        floatingPreview.style.opacity = '0';
        floatingPreview.style.transform = 'translate(-50%, -50%) scale(0.85)';
      });
    });
  }

  // Modal Elements & Logic (Funciona em Desktop E Mobile igualmente!)
  const modal = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalProjectImg');
  const modalIdx = document.getElementById('modalProjectIdx');
  const modalTitle = document.getElementById('modalProjectTitle');
  const modalDiscipline = document.getElementById('modalProjectDiscipline');
  const modalLocation = document.getElementById('modalProjectLocation');
  const modalYear = document.getElementById('modalProjectYear');

  function openProjectModal(item) {
    if (!modal) return;
    
    // Ocultar floating preview se estiver visível
    if (floatingPreview) {
      floatingPreview.style.opacity = '0';
    }

    const imgSrc = item.getAttribute('data-preview');
    const idx = item.querySelector('.project-idx')?.textContent || '01';
    const title = item.querySelector('.project-name')?.textContent || '';
    const discipline = item.querySelector('.project-discipline')?.textContent || '';
    const location = item.querySelector('.project-location')?.textContent || '';
    const year = item.querySelector('.project-year')?.textContent || '';

    if (modalImg) modalImg.src = imgSrc;
    if (modalIdx) modalIdx.textContent = idx;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDiscipline) modalDiscipline.textContent = discipline;
    if (modalLocation) modalLocation.textContent = location;
    if (modalYear) modalYear.textContent = year;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  projectItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openProjectModal(item);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProjectModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeProjectModal();
    }
  });

  // Animações de entrada com ScrollTrigger para as seções (Desktop & Mobile)
  gsap.from('.manifesto-quote', {
    scrollTrigger: {
      trigger: '.manifesto-quote',
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
    y: 40,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
  });

  gsap.from('.metric-item', {
    scrollTrigger: {
      trigger: '.manifesto-metrics',
      start: 'top 90%',
    },
    y: 25,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
  });

  gsap.from('.project-item', {
    scrollTrigger: {
      trigger: '.projects-grid',
      start: 'top 85%',
    },
    y: 35,
    opacity: 0,
    duration: 1.0,
    stagger: 0.15,
    ease: 'power3.out',
  });
}
