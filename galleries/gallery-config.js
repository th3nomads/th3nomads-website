window.TH3NOMADS_GALLERY_API = "https://th3nomads-website.th3nomadscreate.workers.dev";

(() => {
  // Private galleries must require the password on every visit/refresh.
  // Clear old session tokens and prevent the legacy sample gallery from
  // automatically reusing a previous login.
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('th3nomads-session-')) sessionStorage.removeItem(key);
  });

  const nativeSessionGetItem = sessionStorage.getItem.bind(sessionStorage);
  sessionStorage.getItem = key => {
    if (String(key).startsWith('th3nomads-session-')) return null;
    return nativeSessionGetItem(key);
  };

  let expirationNoticeShown = false;

  function currentGalleryName() {
    const params = new URLSearchParams(window.location.search);
    const queryGallery = (params.get('gallery') || '').trim().toLowerCase();
    if (/^[a-z0-9-]+$/.test(queryGallery)) return queryGallery;

    const parts = window.location.pathname.split('/').filter(Boolean);
    const galleriesIndex = parts.indexOf('galleries');
    const pathGallery = galleriesIndex >= 0 ? (parts[galleriesIndex + 1] || '') : '';
    return /^[a-z0-9-]+$/.test(pathGallery) && pathGallery !== 'client.html' ? pathGallery : 'client-gallery';
  }

  function showExpirationNotice() {
    if (expirationNoticeShown || currentGalleryName() === 'sample-gallery') return;
    expirationNoticeShown = true;

    const overlay = document.createElement('div');
    overlay.id = 'galleryExpirationNotice';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'galleryExpirationTitle');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.zIndex = '99999';
    overlay.style.display = 'grid';
    overlay.style.placeItems = 'center';
    overlay.style.padding = '22px';
    overlay.style.background = 'rgba(0,0,0,.82)';
    overlay.style.backdropFilter = 'blur(8px)';

    overlay.innerHTML = `
      <div style="width:min(520px,100%);background:#111;border:1px solid rgba(201,168,93,.55);border-radius:18px;padding:clamp(30px,6vw,48px);text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.55);">
        <div style="width:54px;height:54px;margin:0 auto 20px;border:1px solid #c9a85d;border-radius:50%;display:grid;place-items:center;color:#c9a85d;font:700 1.5rem Arial,sans-serif;">!</div>
        <p style="margin:0 0 12px;color:#c9a85d;font-size:.64rem;letter-spacing:.2em;text-transform:uppercase;">Important Gallery Notice</p>
        <h2 id="galleryExpirationTitle" style="margin:0 0 18px;font:400 clamp(2rem,6vw,3.3rem)/1 Georgia,'Times New Roman',serif;letter-spacing:-.035em;color:#fff;">Please download your photos within 2 weeks.</h2>
        <p style="margin:0 auto 26px;max-width:430px;color:#aaa;font-size:.95rem;line-height:1.75;">Your gallery access is guaranteed for <strong style="color:#fff;">14 days</strong>. Please download and safely back up all of your photographs during this period. After 14 days, continued access to your gallery is <strong style="color:#fff;">not guaranteed</strong> and may be removed without notice.</p>
        <button id="galleryExpirationOk" type="button" style="width:100%;min-height:52px;border:0;background:#c9a85d;color:#111;padding:0 22px;text-transform:uppercase;letter-spacing:.14em;font-size:.7rem;font-weight:700;cursor:pointer;">OK, I Understand</button>
      </div>`;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const ok = overlay.querySelector('#galleryExpirationOk');
    ok.focus();
    ok.addEventListener('click', () => {
      document.body.style.overflow = '';
      overlay.remove();
    });
  }

  function ensureDownloadAllButton() {
    const actions = document.querySelector('.top-actions');
    if (!actions) return null;
    let button = document.getElementById('downloadAllBtn');
    if (button) return button;

    button = document.createElement('a');
    button.id = 'downloadAllBtn';
    button.className = 'btn';
    button.textContent = 'Download All';
    button.hidden = true;
    button.setAttribute('aria-label', 'Download all gallery photos as a ZIP file');

    const favorites = document.getElementById('favoritesBtn');
    if (favorites) actions.insertBefore(button, favorites);
    else actions.appendChild(button);
    return button;
  }

  function makePhotoCountProminent(count) {
    const photoCount = document.getElementById('photoCount');
    if (!photoCount) return;
    photoCount.textContent = `${count} photo${count === 1 ? '' : 's'} available`;
    photoCount.style.display = '';
    photoCount.style.alignItems = '';
    photoCount.style.justifyContent = '';
    photoCount.style.padding = '';
    photoCount.style.border = '';
    photoCount.style.borderRadius = '';
    photoCount.style.background = '';
    photoCount.style.fontWeight = '';
    photoCount.style.letterSpacing = '';
    photoCount.style.color = '#c9a85d';
  }

  function ensureTestimonialForm() {
    const app = document.getElementById('galleryApp');
    if (!app || document.getElementById('galleryTestimonial')) return;

    const section = document.createElement('section');
    section.id = 'galleryTestimonial';
    section.style.maxWidth = '900px';
    section.style.margin = '0 auto 70px';
    section.style.padding = '0 22px';
    section.innerHTML = `
      <div style="border:1px solid rgba(255,255,255,.13);border-radius:18px;background:#111;padding:clamp(28px,5vw,52px);text-align:center;">
        <p style="margin:0 0 14px;color:#c9a85d;font-size:.64rem;letter-spacing:.22em;text-transform:uppercase;">Share Your Experience</p>
        <h2 style="font:400 clamp(2.3rem,5vw,4rem)/1 Georgia,'Times New Roman',serif;letter-spacing:-.035em;margin:0 0 14px;">Leave us a testimonial.</h2>
        <p style="max-width:620px;margin:0 auto 28px;color:#999;line-height:1.7;">We'd love to hear about your experience with TH3NOMADS. Your feedback means a lot to us.</p>
        <form id="testimonialForm" style="display:grid;gap:13px;text-align:left;max-width:680px;margin:auto;">
          <input type="hidden" name="_subject" value="New TH3NOMADS Client Gallery Testimonial">
          <input type="hidden" name="gallery" id="testimonialGallery">
          <label style="display:grid;gap:8px;color:#aaa;font-size:.64rem;letter-spacing:.13em;text-transform:uppercase;">Your name <span style="text-transform:none;letter-spacing:0;color:#666;">(optional)</span>
            <input name="name" placeholder="Your name" style="width:100%;background:#090909;border:1px solid #333;color:#fff;padding:15px 14px;outline:none;">
          </label>
          <label style="display:grid;gap:8px;color:#aaa;font-size:.64rem;letter-spacing:.13em;text-transform:uppercase;">Your testimonial
            <textarea name="message" rows="6" maxlength="3000" required placeholder="Tell us about your experience..." style="width:100%;resize:vertical;background:#090909;border:1px solid #333;color:#fff;padding:15px 14px;outline:none;line-height:1.6;"></textarea>
          </label>
          <button id="testimonialSubmit" type="submit" style="border:0;background:#c9a85d;color:#111;min-height:52px;padding:0 20px;text-transform:uppercase;letter-spacing:.13em;font-size:.68rem;font-weight:700;cursor:pointer;">Submit Testimonial</button>
          <p id="testimonialStatus" aria-live="polite" style="min-height:20px;margin:2px 0 0;text-align:center;color:#999;font-size:.78rem;"></p>
        </form>
      </div>`;

    const footer = app.querySelector('footer');
    if (footer) app.insertBefore(section, footer);
    else app.appendChild(section);

    const form = section.querySelector('#testimonialForm');
    const galleryInput = section.querySelector('#testimonialGallery');
    const status = section.querySelector('#testimonialStatus');
    const submit = section.querySelector('#testimonialSubmit');
    galleryInput.value = currentGalleryName();

    form.addEventListener('submit', async event => {
      event.preventDefault();
      status.textContent = 'Sending your testimonial...';
      status.style.color = '#999';
      submit.disabled = true;
      submit.textContent = 'Sending...';

      try {
        const response = await fetch('https://formspree.io/f/xojgjjrb', {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Unable to submit');
        form.reset();
        galleryInput.value = currentGalleryName();
        status.textContent = 'Thank you! Your testimonial has been sent to TH3NOMADS.';
        status.style.color = '#c9a85d';
      } catch {
        status.textContent = 'We could not send your testimonial. Please try again.';
        status.style.color = '#e6a0a0';
      } finally {
        submit.disabled = false;
        submit.textContent = 'Submit Testimonial';
      }
    });
  }

  function initializeGalleryExtras() {
    ensureDownloadAllButton();
    ensureTestimonialForm();
  }

  initializeGalleryExtras();
  document.addEventListener('DOMContentLoaded', initializeGalleryExtras, { once: true });

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await nativeFetch(...args);
    try {
      const input = args[0];
      const requestUrl = typeof input === 'string' ? input : input?.url || '';
      if (requestUrl.includes('/manifest')) {
        response.clone().json().then(data => {
          const count = Array.isArray(data?.photos) ? data.photos.length : 0;
          makePhotoCountProminent(count);

          if (data?.downloadAllUrl) {
            const button = ensureDownloadAllButton();
            if (button) {
              button.href = data.downloadAllUrl;
              button.hidden = false;
            }
          }

          showExpirationNotice();
        }).catch(() => {});
      }
    } catch {}
    return response;
  };
})();
