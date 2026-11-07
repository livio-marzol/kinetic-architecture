export function initCustomCursor() {
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (isTouchDevice) return;

  const cursorDot = document.querySelector('.custom-cursor');
  const cursorFollower = document.querySelector('.custom-cursor-follower');
  const cursorLabel = document.querySelector('.cursor-label');

  if (!cursorDot || !cursorFollower) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Render loop com amortecimento suave
  function render() {
    // Ponto segue quase que instantaneamente com leve suavização
    dotX += (mouseX - dotX) * 0.45;
    dotY += (mouseY - dotY) * 0.45;
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;

    // Seguidor tem inércia fluida maior
    followerX += (mouseX - followerX) * 0.16;
    followerY += (mouseY - followerY) * 0.16;
    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Escuta todos os elementos com data-cursor ou interativos
  const interactiveElements = document.querySelectorAll('a, button, [data-cursor], .project-item');

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const customText = el.getAttribute('data-cursor');
      if (customText) {
        document.body.classList.add('cursor-action');
        if (cursorLabel) cursorLabel.textContent = customText;
      } else {
        document.body.classList.add('cursor-hover');
      }
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover', 'cursor-action');
      if (cursorLabel) cursorLabel.textContent = '';
    });
  });
}
