'use strict';

// Google Analytics 4
const GA_MEASUREMENT_ID = 'G-HY84HFZZC1';
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
window.gtag('js', new Date());
window.gtag('config', GA_MEASUREMENT_ID);

const gaScript = document.createElement('script');
gaScript.async = true;
gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
document.head.appendChild(gaScript);

const trackEvent = (name, params = {}) => {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
};

document.addEventListener('DOMContentLoaded', () => {
  // Track important business actions without sending names, emails, phone numbers, or messages.
  document.addEventListener('click', event => {
    const filterButton = event.target.closest('.filters button');
    if (filterButton) {
      trackEvent('portfolio_filter', {
        filter_name: filterButton.dataset.filter || 'all'
      });
    }

    const portfolioCard = event.target.closest('.gallery-card');
    if (portfolioCard) {
      trackEvent('portfolio_image_open', {
        category: portfolioCard.dataset.category || 'unknown'
      });
    }

    const control = event.target.closest('button');
    if (control?.id === 'carouselPrev' || control?.id === 'carouselNext') {
      trackEvent('portfolio_carousel_click', {
        direction: control.id === 'carouselPrev' ? 'previous' : 'next'
      });
    }
    if (control?.id === 'videoPrev' || control?.id === 'videoNext') {
      trackEvent('video_carousel_click', {
        direction: control.id === 'videoPrev' ? 'previous' : 'next'
      });
    }
    if (control?.classList.contains('testimonial-read-more')) {
      trackEvent('testimonial_read_more');
    }

    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const label = (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);

    if (href === '#contact') {
      trackEvent('booking_cta_click', { link_text: label });
    } else if (href.includes('instagram.com')) {
      trackEvent('instagram_click', { link_text: label });
    } else if (href.startsWith('mailto:')) {
      trackEvent('email_click', { link_text: label });
    } else if (href.startsWith('galleries/')) {
      trackEvent('client_gallery_click', {
        gallery_destination: href.includes('sample-gallery') ? 'sample_gallery' : 'private_gallery'
      });
    }
  });

  document.querySelectorAll('video').forEach((video, index) => {
    video.addEventListener('play', () => {
      trackEvent('video_play', {
        video_position: index + 1,
        video_title: video.closest('.video-card')?.querySelector('h3')?.textContent?.trim() || `Video ${index + 1}`
      });
    });
  });

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
  let portfolioTimer;
  let portfolioScrollTimer;
  let portfolioResizeTimer;
  let carouselCloneCount = 0;
  let activePortfolioFilter = 'all';

  const originalCardOrder = [...cards];
  const shuffledCardOrder = [...cards];

  // Fisher-Yates gives the All tab a fresh, unbiased order on every page load.
  for (let index = shuffledCardOrder.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledCardOrder[index], shuffledCardOrder[randomIndex]] =
      [shuffledCardOrder[randomIndex], shuffledCardOrder[index]];
  }

  const visibleCards = () => {
    if (!gallery) return [];
    return [...gallery.querySelectorAll('.gallery-card:not(.carousel-clone)')]
      .filter(card => !card.classList.contains('hidden'));
  };

  const removeCarouselClones = () => {
    if (!gallery) return;
    gallery.querySelectorAll('.carousel-clone').forEach(clone => clone.remove());
    carouselCloneCount = 0;
  };

  const cardStep = () => {
    const first = visibleCards()[0];
    if (!first || !gallery) return 350;
    const styles = getComputedStyle(gallery);
    const gap = parseFloat(styles.gap || styles.columnGap) || 18;
    return first.getBoundingClientRect().width + gap;
  };

  const logicalCarouselIndex = () => {
    const list = visibleCards();
    if (!gallery || !list.length) return 0;
    const physicalIndex = Math.round(gallery.scrollLeft / cardStep());
    return ((physicalIndex - carouselCloneCount) % list.length + list.length) % list.length;
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

    const index = activePortfolioFilter === 'all'
      ? logicalCarouselIndex()
      : 0;

    currentSlide.textContent = String(index + 1).padStart(2, '0');
    if (progress) progress.style.width = `${((index + 1) / total) * 100}%`;
  };

  const makeCarouselClone = card => {
    const clone = card.cloneNode(true);
    clone.classList.add('carousel-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('tabindex');
    clone.querySelectorAll('button, a').forEach(element => {
      element.tabIndex = -1;
    });
    return clone;
  };

  const buildInfiniteCarousel = () => {
    if (!gallery || activePortfolioFilter !== 'all' || !cards.length) return;

    removeCarouselClones();
    shuffledCardOrder.forEach(card => gallery.appendChild(card));

    const step = cardStep();
    const cardsInView = Math.ceil(gallery.clientWidth / step) + 1;
    carouselCloneCount = Math.min(cards.length, cardsInView);

    const leading = document.createDocumentFragment();
    shuffledCardOrder.slice(-carouselCloneCount).forEach(card => {
      leading.appendChild(makeCarouselClone(card));
    });
    gallery.insertBefore(leading, gallery.firstChild);

    const trailing = document.createDocumentFragment();
    shuffledCardOrder.slice(0, carouselCloneCount).forEach(card => {
      trailing.appendChild(makeCarouselClone(card));
    });
    gallery.appendChild(trailing);

    gallery.scrollTo({
      left: carouselCloneCount * cardStep(),
      behavior: 'auto'
    });
    updateCounter();
  };

  const normalizeInfinitePosition = () => {
    if (!gallery || activePortfolioFilter !== 'all') return;
    const total = visibleCards().length;
    if (!total) return;

    const step = cardStep();
    const physicalIndex = Math.round(gallery.scrollLeft / step);
    let normalizedIndex = physicalIndex;

    if (physicalIndex >= carouselCloneCount + total) {
      normalizedIndex = physicalIndex - total;
    } else if (physicalIndex < carouselCloneCount) {
      normalizedIndex = physicalIndex + total;
    }

    if (normalizedIndex !== physicalIndex) {
      gallery.scrollTo({
        left: normalizedIndex * step,
        behavior: 'auto'
      });
    }
    updateCounter();
  };

  const movePortfolio = direction => {
    if (!gallery || activePortfolioFilter !== 'all') return;
    const list = visibleCards();
    if (!list.length) return;

    const step = cardStep();
    const currentIndex = Math.round(gallery.scrollLeft / step);
    gallery.scrollTo({
      left: (currentIndex + direction) * step,
      behavior: 'smooth'
    });
  };

  const stopPortfolioAutoplay = () => clearInterval(portfolioTimer);

  const startPortfolioAutoplay = () => {
    stopPortfolioAutoplay();
    if (activePortfolioFilter !== 'all') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    portfolioTimer = setInterval(() => movePortfolio(1), 4000);
  };

  const applyFilter = filter => {
    const showAll = filter === 'all';
    activePortfolioFilter = filter;
    stopPortfolioAutoplay();
    removeCarouselClones();

    const order = showAll ? shuffledCardOrder : originalCardOrder;
    order.forEach(card => gallery?.appendChild(card));

    cards.forEach(card => {
      card.classList.toggle('hidden', !showAll && card.dataset.category !== filter);
    });

    if (gallery) {
      gallery.classList.toggle('all-carousel', showAll);
      gallery.scrollTo({ left: 0, behavior: 'auto' });
    }

    if (controls) controls.style.display = showAll ? 'flex' : 'none';

    if (showAll) {
      requestAnimationFrame(() => {
        buildInfiniteCarousel();
        startPortfolioAutoplay();
      });
    } else {
      requestAnimationFrame(updateCounter);
    }
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
      movePortfolio(-1);
      startPortfolioAutoplay();
    });
  }

  if (next && gallery) {
    next.addEventListener('click', () => {
      movePortfolio(1);
      startPortfolioAutoplay();
    });
  }

  if (gallery) {
    let frame;
    gallery.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateCounter);
      clearTimeout(portfolioScrollTimer);
      portfolioScrollTimer = setTimeout(normalizeInfinitePosition, 160);
    }, { passive: true });
  }
//video highlight section
  const videoCarousel = document.querySelector('#videoCarousel');
const videoPrev = document.querySelector('#videoPrev');
const videoNext = document.querySelector('#videoNext');
const currentVideo = document.querySelector('#currentVideo');
const totalVideos = document.querySelector('#totalVideos');

if (videoCarousel) {
  const videoCards = [...videoCarousel.querySelectorAll('.video-card')];

  totalVideos.textContent =
    String(videoCards.length).padStart(2, '0');

  const getVideoStep = () => {
    const firstCard = videoCards[0];

    if (!firstCard) return 720;

    const styles = getComputedStyle(videoCarousel);
    const gap = parseFloat(styles.gap) || 20;

    return firstCard.getBoundingClientRect().width + gap;
  };

  const updateVideoCounter = () => {
    if (!videoCards.length) return;

    const index = Math.min(
      Math.max(
        Math.round(videoCarousel.scrollLeft / getVideoStep()),
        0
      ),
      videoCards.length - 1
    );

    currentVideo.textContent =
      String(index + 1).padStart(2, '0');
  };

  videoPrev?.addEventListener('click', () => {
    videoCarousel.scrollBy({
      left: -getVideoStep(),
      behavior: 'smooth'
    });
  });

  videoNext?.addEventListener('click', () => {
    videoCarousel.scrollBy({
      left: getVideoStep(),
      behavior: 'smooth'
    });
  });

  videoCarousel.addEventListener(
    'scroll',
    updateVideoCounter,
    { passive: true }
  );

  window.addEventListener('resize', updateVideoCounter);

  updateVideoCounter();
}
  window.addEventListener('resize', () => {
    clearTimeout(portfolioResizeTimer);
    portfolioResizeTimer = setTimeout(() => {
      if (activePortfolioFilter === 'all') buildInfiniteCarousel();
      else updateCounter();
    }, 180);
  });
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


  // Testimonials carousel
  const testimonialCarousel = document.querySelector('#testimonialCarousel');
  const testimonialPrev = document.querySelector('#testimonialPrev');
  const testimonialNext = document.querySelector('#testimonialNext');
  const currentTestimonial = document.querySelector('#currentTestimonial');
  const totalTestimonials = document.querySelector('#totalTestimonials');
  const testimonialProgress = document.querySelector('#testimonialProgress');
  const testimonialModal = document.querySelector('#testimonialModal');
  const testimonialModalQuote = document.querySelector('#testimonialModalQuote');
  const testimonialModalName = document.querySelector('#testimonialModalName');
  const testimonialModalService = document.querySelector('#testimonialModalService');

  if (testimonialCarousel) {
    const testimonialCards = [...testimonialCarousel.querySelectorAll('.testimonial-card')];
    let testimonialTimer;

    if (totalTestimonials) {
      totalTestimonials.textContent = String(testimonialCards.length).padStart(2, '0');
    }

    const testimonialStep = () => {
      const first = testimonialCards[0];
      if (!first) return 980;
      const gap = parseFloat(getComputedStyle(testimonialCarousel).gap) || 20;
      return first.getBoundingClientRect().width + gap;
    };

    const updateTestimonialCounter = () => {
      if (!testimonialCards.length || !currentTestimonial) return;
      const index = Math.min(
        Math.max(Math.round(testimonialCarousel.scrollLeft / testimonialStep()), 0),
        testimonialCards.length - 1
      );

      currentTestimonial.textContent = String(index + 1).padStart(2, '0');

      if (testimonialProgress) {
        testimonialProgress.style.width = `${((index + 1) / testimonialCards.length) * 100}%`;
      }
    };

    const moveTestimonial = direction => {
      const index = Math.round(testimonialCarousel.scrollLeft / testimonialStep());
      const nextIndex = (index + direction + testimonialCards.length) % testimonialCards.length;
      testimonialCarousel.scrollTo({
        left: nextIndex * testimonialStep(),
        behavior: 'smooth'
      });
    };

    const stopTestimonialAutoplay = () => clearInterval(testimonialTimer);

    const startTestimonialAutoplay = () => {
      stopTestimonialAutoplay();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      testimonialTimer = setInterval(() => moveTestimonial(1), 6500);
    };

    const openTestimonialModal = card => {
      const quote = card.querySelector('blockquote');
      const name = card.querySelector('.testimonial-client strong');
      const service = card.querySelector('.testimonial-client span');

      if (!testimonialModal || !quote || !testimonialModalQuote) return;

      testimonialModalQuote.textContent = quote.textContent.trim();
      if (testimonialModalName) {
        testimonialModalName.textContent = name?.textContent.trim() || 'TH3NOMADS Client';
      }
      if (testimonialModalService) {
        testimonialModalService.textContent = service?.textContent.trim() || '';
      }

      stopTestimonialAutoplay();
      testimonialModal.showModal();
    };

    const updateReadMoreButtons = () => {
      testimonialCards.forEach(card => {
        const quote = card.querySelector('blockquote');
        const button = card.querySelector('.testimonial-read-more');
        if (!quote || !button) return;

        // A clipped quote has more scrollable content than visible content.
        const clipped = quote.scrollHeight > quote.clientHeight + 2;
        button.classList.toggle('is-visible', clipped);
        button.setAttribute('aria-hidden', String(!clipped));
        button.tabIndex = clipped ? 0 : -1;
      });
    };

    testimonialCards.forEach(card => {
      const button = card.querySelector('.testimonial-read-more');
      button?.addEventListener('click', () => openTestimonialModal(card));
    });

    testimonialPrev?.addEventListener('click', () => {
      moveTestimonial(-1);
      startTestimonialAutoplay();
    });

    testimonialNext?.addEventListener('click', () => {
      moveTestimonial(1);
      startTestimonialAutoplay();
    });

    testimonialCarousel.addEventListener('scroll', updateTestimonialCounter, { passive: true });
    testimonialCarousel.addEventListener('mouseenter', stopTestimonialAutoplay);
    testimonialCarousel.addEventListener('mouseleave', startTestimonialAutoplay);
    testimonialCarousel.addEventListener('focusin', stopTestimonialAutoplay);
    testimonialCarousel.addEventListener('focusout', event => {
      if (!testimonialCarousel.contains(event.relatedTarget)) startTestimonialAutoplay();
    });

    testimonialModal?.querySelector('.testimonial-modal-close')?.addEventListener('click', () => {
      testimonialModal.close();
    });

    testimonialModal?.addEventListener('click', event => {
      if (event.target === testimonialModal) testimonialModal.close();
    });

    testimonialModal?.addEventListener('close', startTestimonialAutoplay);

    window.addEventListener('resize', () => {
      updateTestimonialCounter();
      requestAnimationFrame(updateReadMoreButtons);
    });

    updateTestimonialCounter();
    requestAnimationFrame(updateReadMoreButtons);
    window.addEventListener('load', updateReadMoreButtons, { once: true });
    startTestimonialAutoplay();
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
      const eventType = form.querySelector('[name="event"]')?.value || 'not_selected';
      const hoursNeeded = form.querySelector('[name="hours"]')?.value || 'not_selected';
      trackEvent('generate_lead', {
        form_id: 'inquiryForm',
        event_type: eventType,
        hours_needed: hoursNeeded
      });
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
