window.TH3NOMADS_GALLERY_API = "https://th3nomads-website.th3nomadscreate.workers.dev";

// Require a fresh password each time a private gallery page is opened.
// Favorites remain in localStorage, but authentication tokens are never reused
// after leaving or refreshing the gallery page.
for (let i = sessionStorage.length - 1; i >= 0; i--) {
  const key = sessionStorage.key(i);
  if (key && key.startsWith('th3nomads-session-')) sessionStorage.removeItem(key);
}

(() => {
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
          if (!data?.downloadAllUrl) return;
          const button = ensureDownloadAllButton();
          if (!button) return;
          button.href = data.downloadAllUrl;
          button.hidden = false;
        }).catch(() => {});
      }
    } catch {}
    return response;
  };
})();
