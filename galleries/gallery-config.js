window.TH3NOMADS_GALLERY_API = "https://th3nomads-website.th3nomadscreate.workers.dev";

(() => {
  // Private galleries must require the password on every visit/refresh.
  // Clear old session tokens and prevent the gallery page's legacy auto-login
  // code from reading a stored token.
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('th3nomads-session-')) sessionStorage.removeItem(key);
  });

  const nativeSessionGetItem = sessionStorage.getItem.bind(sessionStorage);
  sessionStorage.getItem = key => {
    if (String(key).startsWith('th3nomads-session-')) return null;
    return nativeSessionGetItem(key);
  };

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
    photoCount.textContent = `${count} Photo${count === 1 ? '' : 's'} Available`;
    photoCount.style.display = 'inline-flex';
    photoCount.style.alignItems = 'center';
    photoCount.style.justifyContent = 'center';
    photoCount.style.padding = '10px 16px';
    photoCount.style.border = '1px solid rgba(201,168,93,.55)';
    photoCount.style.borderRadius = '999px';
    photoCount.style.color = '#c9a85d';
    photoCount.style.background = 'rgba(201,168,93,.08)';
    photoCount.style.fontWeight = '700';
    photoCount.style.letterSpacing = '.12em';
  }

  ensureDownloadAllButton();
  document.addEventListener('DOMContentLoaded', ensureDownloadAllButton, { once: true });

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
        }).catch(() => {});
      }
    } catch {}
    return response;
  };
})();
