(() => {
  'use strict';

  const header = document.querySelector('#site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navLinksPanel = document.querySelector('#nav-links');

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
  const closeMenu = () => {
    menuButton.classList.remove('open');
    navLinksPanel.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.classList.toggle('open', !isOpen);
    navLinksPanel.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  });

  navLinksPanel.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (!navLinksPanel.classList.contains('open')) return;
    if (!navLinksPanel.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });
})();
