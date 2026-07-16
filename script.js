'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');

  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('visible'));
  }

  const filters = [...document.querySelectorAll('.filters button')];
  const cards = [...document.querySelectorAll('.gallery-card')];
  const gallery = document.querySelector('#portfolioGallery');
  const controls = document.querySelector('#carouselControls');
  const prev = document.querySelector('#carouselPrev');
  const next = document.querySelector('#carouselNext');
  const currentSlide = document.querySelector('#currentSlide');
  const totalSlides = document.querySelector('#totalSlides');
  const progress = document.querySelector('#carouselProgress');

  const visibleCards = () => cards.filter(card => !card.classList.contains('hidden'));

  const cardStep = () => {
    const first = visibleCards()[0];
    if (!first || !gallery) return 350;
    const styles = getComputedStyle(gallery);
    const gap = parseFloat(styles.gap || styles.columnGap) || 18;
    return first.getBoundingClientRect().width + gap;
  };

  const updateCounter = () => {
    if (!gallery || !currentSlide || !totalSlides) return;
    const list = visibleCards();
    const total = list.length;
    totalSlides.textContent = String(total).padStart(2, '0');

    if (!total) {
      currentSlide.textContent = '00';
      if (progress) progress.style.width = '0%';
      return;
    }

    const index = Math.min(
      Math.max(Math.round(gallery.scrollLeft / cardStep()), 0),
      total - 1
    );

    currentSlide.textContent = String(index + 1).padStart(2, '0');
    if (progress) progress.style.width = `${((index + 1) / total) * 100}%`;
  };

  const applyFilter = filter => {
    const showAll = filter === 'all';

    cards.forEach(card => {
      card.classList.toggle('hidden', !showAll && card.dataset.category !== filter);
    });

    if (gallery) {
      gallery.classList.toggle('all-carousel', showAll);
      if (showAll) gallery.scrollTo({ left: 0, behavior: 'auto' });
    }

    if (controls) controls.style.display = showAll ? 'flex' : 'none';
    requestAnimationFrame(updateCounter);
  };

  filters.forEach(button => {
    button.addEventListener('click', () => {
      filters.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      applyFilter(button.dataset.filter || 'all');
    });
  });

  if (prev && gallery) {
    prev.addEventListener('click', () => {
      gallery.scrollBy({ left: -cardStep(), behavior: 'smooth' });
    });
  }

  if (next && gallery) {
    next.addEventListener('click', () => {
      gallery.scrollBy({ left: cardStep(), behavior: 'smooth' });
    });
  }

  if (gallery) {
    let frame;
    gallery.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateCounter);
    }, { passive: true });
  }

  window.addEventListener('resize', updateCounter);
  const active = filters.find(button => button.classList.contains('active')) || filters[0];
  if (active) applyFilter(active.dataset.filter || 'all');

  const lightbox = document.querySelector('.lightbox');
  if (lightbox && cards.length) {
    const image = lightbox.querySelector('img');
    const close = lightbox.querySelector('.lightbox-close');
    const lightPrev = lightbox.querySelector('.lightbox-prev');
    const lightNext = lightbox.querySelector('.lightbox-next');
    let activeIndex = 0;

    const showAt = index => {
      const list = visibleCards();
      if (!list.length || !image) return;
      activeIndex = (index + list.length) % list.length;
      const selected = list[activeIndex].querySelector('img');
      image.src = selected.src;
      image.alt = selected.alt || 'Expanded portfolio image';
    };

    cards.forEach(card => {
      const openCard = () => {
        activeIndex = visibleCards().indexOf(card);
        if (activeIndex < 0) return;
        showAt(activeIndex);
        lightbox.showModal();
      };
      card.addEventListener('click', openCard);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCard();
        }
      });
    });

    close?.addEventListener('click', () => lightbox.close());
    lightPrev?.addEventListener('click', event => {
      event.stopPropagation();
      showAt(activeIndex - 1);
    });
    lightNext?.addEventListener('click', event => {
      event.stopPropagation();
      showAt(activeIndex + 1);
    });
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) lightbox.close();
    });
    document.addEventListener('keydown', event => {
      if (!lightbox.open) return;
      if (event.key === 'ArrowLeft') showAt(activeIndex - 1);
      if (event.key === 'ArrowRight') showAt(activeIndex + 1);
      if (event.key === 'Escape') lightbox.close();
    });
  }

  const glow = document.querySelector('.cursor-glow');
  if (glow) {
    window.addEventListener('pointermove', event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  const form = document.querySelector('#inquiryForm');
  const formNote = document.querySelector('#formNote');
  if (form && formNote) {
    form.addEventListener('submit', () => {
      formNote.textContent = 'Sending your inquiry...';
      formNote.style.color = '#c9a85d';
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      closeMenu();

      const scrollToTarget = () => {
        const offset = (header?.offsetHeight || 0) + 12;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      };

      scrollToTarget();
      setTimeout(scrollToTarget, 250);
      setTimeout(scrollToTarget, 700);
      history.replaceState(null, '', id);
    });
  });
});
