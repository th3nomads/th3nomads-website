(() => {
  const isPhoneLike = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && window.matchMedia('(max-width: 1024px)').matches);
  if (!isPhoneLike) return;

  let galleryData = null;
  let batches = [];
  let batchIndex = 0;
  let preparedFiles = [];
  let preparing = false;

  function chunk(items, size, kind) {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push({ kind, items: items.slice(i, i + size) });
    return out;
  }

  function buildBatches(data) {
    const photos = Array.isArray(data?.photos) ? data.photos : [];
    const videos = Array.isArray(data?.videos) ? data.videos : [];
    return [...chunk(photos, 8, 'photos'), ...chunk(videos, 1, 'videos')];
  }

  function inferType(name, blobType) {
    if (blobType) return blobType;
    const ext = String(name || '').split('.').pop().toLowerCase();
    return ({ jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', webp:'image/webp', mp4:'video/mp4', mov:'video/quicktime', m4v:'video/x-m4v', webm:'video/webm' })[ext] || 'application/octet-stream';
  }

  function ensurePanel() {
    let overlay = document.getElementById('mobileSaveOverlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'mobileSaveOverlay';
    overlay.hidden = true;
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.86);backdrop-filter:blur(10px);padding:18px;overflow:auto;';
    overlay.innerHTML = `
      <div style="width:min(520px,100%);margin:5vh auto;background:#111;border:1px solid rgba(201,168,93,.5);border-radius:20px;padding:clamp(26px,6vw,42px);box-shadow:0 24px 80px rgba(0,0,0,.55);">
        <button id="mobileSaveClose" type="button" aria-label="Close" style="float:right;border:0;background:transparent;color:#aaa;font-size:1.8rem;line-height:1;cursor:pointer;">×</button>
        <p style="margin:0 0 12px;color:#c9a85d;font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;">Save to Phone</p>
        <h2 style="margin:0 0 14px;font:400 clamp(2.1rem,9vw,3.5rem)/1 Georgia,'Times New Roman',serif;color:#f6f1e8;letter-spacing:-.04em;">Save your gallery to your phone.</h2>
        <p id="mobileSaveIntro" style="margin:0 0 24px;color:#aaa;line-height:1.7;font-size:.92rem;">To keep your phone responsive, your gallery is prepared in small batches. For each batch, tap <strong style="color:#fff;">Save This Batch</strong>, then choose the photo/video save option offered by your phone. Return here and tap <strong style="color:#fff;">Next Batch</strong>.</p>
        <div style="height:1px;background:rgba(255,255,255,.1);margin:0 0 22px;"></div>
        <p id="mobileSaveProgress" style="margin:0 0 9px;color:#c9a85d;font-size:.68rem;letter-spacing:.13em;text-transform:uppercase;"></p>
        <p id="mobileSaveStatus" aria-live="polite" style="margin:0 0 20px;color:#aaa;line-height:1.6;min-height:48px;">Preparing…</p>
        <button id="mobileSaveShare" type="button" disabled style="width:100%;min-height:54px;border:0;background:#c9a85d;color:#111;text-transform:uppercase;letter-spacing:.12em;font-size:.7rem;font-weight:700;cursor:pointer;opacity:.55;">Preparing…</button>
        <button id="mobileSaveNext" type="button" hidden style="width:100%;min-height:50px;margin-top:10px;border:1px solid rgba(255,255,255,.28);background:transparent;color:#fff;text-transform:uppercase;letter-spacing:.12em;font-size:.68rem;cursor:pointer;">Next Batch</button>
        <a id="mobileSaveZip" class="btn" style="display:block;margin-top:14px;text-align:center;color:#888;border-color:#333;">Download ZIP Instead</a>
        <p style="margin:18px 0 0;color:#666;font-size:.72rem;line-height:1.6;">Your phone controls the final save destination. TH3NOMADS cannot silently add files to your Photos library without your approval.</p>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#mobileSaveClose').onclick = closePanel;
    overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
    overlay.querySelector('#mobileSaveNext').onclick = () => {
      if (batchIndex < batches.length - 1) {
        batchIndex += 1;
        prepareCurrentBatch();
      } else {
        showComplete();
      }
    };
    overlay.querySelector('#mobileSaveShare').onclick = () => {
      if (!preparedFiles.length || !navigator.share) return;
      const current = batches[batchIndex];
      const label = current.kind === 'videos' ? 'video' : 'photos';
      navigator.share({
        title: `${document.getElementById('galleryTitle')?.textContent || 'TH3NOMADS'} Gallery`,
        text: `TH3NOMADS gallery ${label}`,
        files: preparedFiles
      }).catch(err => {
        if (err?.name !== 'AbortError') {
          const status = document.getElementById('mobileSaveStatus');
          if (status) status.textContent = 'Your phone could not open the save/share menu for this batch. You can try again or use the ZIP option below.';
        }
      });
      overlay.querySelector('#mobileSaveNext').hidden = false;
    };
    return overlay;
  }

  function closePanel() {
    const overlay = document.getElementById('mobileSaveOverlay');
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = '';
  }

  function openPanel() {
    batches = buildBatches(galleryData);
    batchIndex = 0;
    const overlay = ensurePanel();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    const zip = overlay.querySelector('#mobileSaveZip');
    zip.href = galleryData?.downloadAllUrl || '#';
    if (!batches.length) {
      overlay.querySelector('#mobileSaveStatus').textContent = 'There are no gallery files available to save.';
      return;
    }
    prepareCurrentBatch();
  }

  async function prepareCurrentBatch() {
    if (preparing) return;
    preparing = true;
    preparedFiles = [];
    const overlay = ensurePanel();
    const progress = overlay.querySelector('#mobileSaveProgress');
    const status = overlay.querySelector('#mobileSaveStatus');
    const share = overlay.querySelector('#mobileSaveShare');
    const next = overlay.querySelector('#mobileSaveNext');
    const batch = batches[batchIndex];
    const count = batch.items.length;
    const noun = batch.kind === 'videos' ? (count === 1 ? 'video' : 'videos') : (count === 1 ? 'photo' : 'photos');

    progress.textContent = `Batch ${batchIndex + 1} of ${batches.length}`;
    status.textContent = `Preparing ${count} ${noun}…`;
    share.disabled = true;
    share.style.opacity = '.55';
    share.textContent = 'Preparing…';
    next.hidden = true;

    try {
      const files = [];
      for (let i = 0; i < batch.items.length; i++) {
        const item = batch.items[i];
        status.textContent = `Preparing ${i + 1} of ${count} ${noun}…`;
        const response = await fetch(item.url, { cache:'no-store' });
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        files.push(new File([blob], item.name, { type: inferType(item.name, blob.type), lastModified: Date.now() }));
      }

      if (!navigator.share || !navigator.canShare || !navigator.canShare({ files })) {
        throw new Error('File sharing is not supported by this browser');
      }

      preparedFiles = files;
      status.textContent = `${count} ${noun} ready. Tap “Save This Batch,” choose the save option on your phone, then return here.`;
      share.textContent = batch.kind === 'videos' ? `Save ${count} Video${count === 1 ? '' : 's'}` : `Save ${count} Photo${count === 1 ? '' : 's'}`;
      share.disabled = false;
      share.style.opacity = '1';
    } catch (err) {
      preparedFiles = [];
      status.textContent = 'Direct saving is not supported for this batch on your browser. You can use the ZIP option below or download individual files.';
      share.textContent = 'Save Unavailable';
      share.disabled = true;
      share.style.opacity = '.55';
    } finally {
      preparing = false;
    }
  }

  function showComplete() {
    const overlay = ensurePanel();
    overlay.querySelector('#mobileSaveProgress').textContent = 'All batches complete';
    overlay.querySelector('#mobileSaveStatus').textContent = 'You have reached the end of the gallery. Make sure each batch was saved to your phone before closing this window.';
    const share = overlay.querySelector('#mobileSaveShare');
    share.hidden = true;
    const next = overlay.querySelector('#mobileSaveNext');
    next.hidden = false;
    next.textContent = 'Done';
    next.onclick = closePanel;
  }

  function configureButton() {
    const data = window.TH3NOMADS_GALLERY_META;
    const button = document.getElementById('downloadAllBtn');
    if (!data || !button || button.dataset.mobileSaveReady === 'true') return;
    galleryData = data;
    button.dataset.mobileSaveReady = 'true';
    button.textContent = 'Save to Phone';
    button.setAttribute('aria-label', 'Save gallery photos and videos to your phone');
    button.removeAttribute('href');
    button.style.cursor = 'pointer';
    button.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openPanel();
    }, true);
  }

  const observer = new MutationObserver(configureButton);
  observer.observe(document.documentElement, { childList:true, subtree:true, attributes:true });
  window.addEventListener('load', configureButton);
  setInterval(configureButton, 500);
})();
