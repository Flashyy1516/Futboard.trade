(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('#site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const navLinksPanel = document.querySelector('#nav-links');
  const navLinks = [...document.querySelectorAll('.nav-links a')];

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    menuButton.classList.remove('open');
    navLinksPanel.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.classList.toggle('open', !isOpen);
    navLinksPanel.classList.toggle('open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (!navLinksPanel.classList.contains('open')) return;
    if (!navLinksPanel.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((element) => {
    element.style.setProperty('--delay', element.dataset.delay || '0');
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const observedSections = ['top', 'demo', 'pricing', 'how-it-works', 'faq']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const activeObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${visible.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }, { threshold: 0, rootMargin: '-30% 0px -65%' });
  observedSections.forEach((section) => activeObserver.observe(section));

  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

  const heroNodes = [...document.querySelectorAll('.server-node')];
  let heroAnimationRunning = false;
  const runHeroDistribution = async () => {
    if (reduceMotion || heroAnimationRunning || document.hidden) return;
    heroAnimationRunning = true;
    heroNodes.forEach((node) => {
      node.classList.remove('visible', 'sent');
      node.querySelector('b').textContent = 'WAITING';
    });
    for (const node of heroNodes) {
      node.classList.add('visible');
      node.querySelector('b').textContent = 'SENDING';
      await wait(450);
      node.classList.add('sent');
      node.querySelector('b').textContent = 'SENT ✓';
      await wait(280);
    }
    heroAnimationRunning = false;
  };

  if (!reduceMotion) {
    window.setTimeout(runHeroDistribution, 900);
    window.setInterval(runHeroDistribution, 9000);
  } else {
    heroNodes.forEach((node) => {
      node.classList.add('visible', 'sent');
      node.querySelector('b').textContent = 'SENT ✓';
    });
  }

  const form = document.querySelector('#trade-form');
  const serverButtons = [...document.querySelectorAll('.server-select')];
  const selectionCopy = document.querySelector('#selection-copy');
  const publishButton = document.querySelector('#publish-demo');
  const resetButton = document.querySelector('#reset-demo');
  const result = document.querySelector('#demo-result');
  const progress = document.querySelector('#progress-line');
  let demoRunning = false;

  const selectedServers = () => serverButtons.filter((button) => button.classList.contains('selected'));
  const updateSelection = () => {
    const count = selectedServers().length;
    selectionCopy.textContent = `${count} ${count === 1 ? 'community' : 'communities'} selected.`;
    publishButton.disabled = count === 0;
    publishButton.innerHTML = count ? `Publish to ${count} ${count === 1 ? 'server' : 'servers'} <span>→</span>` : 'Select a server';
  };

  serverButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (demoRunning) return;
      const selected = !button.classList.contains('selected');
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.querySelector('.server-state').textContent = selected ? 'Selected' : 'Not selected';
      updateSelection();
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const targets = selectedServers();
    if (!targets.length || demoRunning) return;

    demoRunning = true;
    serverButtons.forEach((button) => { button.disabled = true; });
    publishButton.disabled = true;
    publishButton.innerHTML = 'Distributing…';
    result.className = 'demo-result';
    result.textContent = 'Preparing distribution network…';
    progress.style.width = '4%';

    targets.forEach((button) => {
      button.classList.add('waiting');
      button.querySelector('.server-state').textContent = 'Waiting';
    });

    const stepTime = reduceMotion ? 60 : 520;
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      target.classList.remove('waiting');
      target.classList.add('sending');
      target.querySelector('.server-state').textContent = 'Sending';
      result.textContent = `Sending to ${target.dataset.server}…`;
      progress.style.width = `${Math.round(((index + .55) / targets.length) * 100)}%`;
      await wait(stepTime);

      target.classList.remove('sending');
      target.classList.add('sent');
      target.querySelector('.server-state').textContent = 'Sent ✓';
      progress.style.width = `${Math.round(((index + 1) / targets.length) * 100)}%`;
      await wait(reduceMotion ? 20 : 180);
    }

    result.className = 'demo-result success';
    result.innerHTML = `Trade distributed successfully<span>${targets.length}/${targets.length} destinations reached</span>`;
    publishButton.hidden = true;
    resetButton.hidden = false;
    serverButtons.forEach((button) => { button.disabled = false; });
    resetButton.focus({ preventScroll: true });
    demoRunning = false;
  });

  resetButton.addEventListener('click', () => {
    serverButtons.forEach((button) => {
      button.classList.remove('waiting', 'sending', 'sent');
      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      button.querySelector('.server-state').textContent = 'Selected';
      button.disabled = false;
    });
    progress.style.width = '0';
    result.className = 'demo-result';
    result.textContent = '';
    publishButton.hidden = false;
    resetButton.hidden = true;
    updateSelection();
    publishButton.focus({ preventScroll: true });
  });
  updateSelection();

  const accordionItems = [...document.querySelectorAll('.accordion details')];
  accordionItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      accordionItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

})();
