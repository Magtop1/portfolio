(() => {
  'use strict';

  const hd = document.getElementById('hd');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const year = document.getElementById('year');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (year) year.textContent = new Date().getFullYear();

  /* Header state */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      hd.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const closeNav = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    document.body.classList.remove('nav-open');
  };

  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('nav-open', open);
  });

  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
  });

  /* Reveal on scroll */
  const items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...el.parentElement.children].filter((n) => n.classList.contains('rv'));
        const i = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }

  /* Safety net: never leave content invisible if reveal never fired */
  window.setTimeout(() => {
    document.querySelectorAll('.rv:not(.in)').forEach((el) => el.classList.add('in'));
  }, 2500);

  /* Lightbox */
  if (lightbox && lightbox.showModal) {
    document.querySelectorAll('[data-full]').forEach((btn) => {
      btn.addEventListener('click', () => {
        lightboxImg.src = btn.dataset.full;
        lightbox.showModal();
        document.body.classList.add('nav-open');
        lightboxClose.focus();
      });
    });

    const closeLightbox = () => {
      lightbox.close();
      lightboxImg.src = '';
      document.body.classList.remove('nav-open');
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    lightbox.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeLightbox();
    });
  }
})();
