const enc = new TextEncoder();
const dec = new TextDecoder();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (request.method === 'POST' && url.pathname === '/api/login') {
        const body = await request.json();
        const gallery = cleanSlug(body.gallery);
        const password = String(body.password || '');
        const passwords = JSON.parse(env.GALLERY_PASSWORDS || '{}');
        if (!gallery || !passwords[gallery] || !safeEqual(password, String(passwords[gallery]))) {
          return json({ error: 'Invalid gallery or password' }, 401, cors);
        }
        const token = await signSession({ gallery, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 }, env.SESSION_SECRET);
        return json({ token }, 200, cors);
      }

      const manifestMatch = url.pathname.match(/^\/api\/gallery\/([a-z0-9-]+)\/manifest$/);
      if (request.method === 'GET' && manifestMatch) {
        const gallery = cleanSlug(manifestMatch[1]);
        const auth = request.headers.get('Authorization') || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
        const session = await verifySession(token, env.SESSION_SECRET);
        if (!session || session.gallery !== gallery) return json({ error: 'Unauthorized' }, 401, cors);

        const prefix = `galleries/${gallery}/photos/`;
        const objects = await listAll(env.GALLERY_BUCKET, prefix);
        const files = objects
          .filter(o => /\.(jpe?g|png|webp)$/i.test(o.key))
          .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));

        let meta = { title: gallery, subtitle: 'Private Client Gallery' };
        const metaObject = await env.GALLERY_BUCKET.get(`galleries/${gallery}/gallery.json`);
        if (metaObject) {
          try { meta = { ...meta, ...JSON.parse(await metaObject.text()) }; } catch {}
        }

        const exp = Math.floor(Date.now() / 1000) + 60 * 30;
        const photos = await Promise.all(files.map(async (o, i) => {
          const file = o.key.slice(prefix.length);
          const sig = await signAsset(`${gallery}|${file}|${exp}`, env.SESSION_SECRET);
          const base = `${url.origin}/api/gallery/${gallery}/file/${encodeURIComponent(file)}?exp=${exp}&sig=${encodeURIComponent(sig)}`;
          return { id: i + 1, name: file, url: base, downloadUrl: `${base}&download=1` };
        }));

        return json({ gallery, title: meta.title, subtitle: meta.subtitle, photos }, 200, cors);
      }

      const fileMatch = url.pathname.match(/^\/api\/gallery\/([a-z0-9-]+)\/file\/(.+)$/);
      if (request.method === 'GET' && fileMatch) {
        const gallery = cleanSlug(fileMatch[1]);
        const file = decodeURIComponent(fileMatch[2]);
        if (!gallery || file.includes('/') || file.includes('..')) return new Response('Bad request', { status: 400, headers: cors });
        const exp = Number(url.searchParams.get('exp') || 0);
        const sig = url.searchParams.get('sig') || '';
        if (!exp || exp < Math.floor(Date.now() / 1000)) return new Response('Link expired', { status: 401, headers: cors });
        const expected = await signAsset(`${gallery}|${file}|${exp}`, env.SESSION_SECRET);
        if (!safeEqual(sig, expected)) return new Response('Unauthorized', { status: 401, headers: cors });

        const object = await env.GALLERY_BUCKET.get(`galleries/${gallery}/photos/${file}`);
        if (!object) return new Response('Not found', { status: 404, headers: cors });
        const headers = new Headers(cors);
        object.writeHttpMetadata(headers);
        headers.set('ETag', object.httpEtag);
        headers.set('Cache-Control', 'private, max-age=1800');
        if (url.searchParams.get('download') === '1') headers.set('Content-Disposition', `attachment; filename="${file.replace(/"/g, '')}"`);
        return new Response(object.body, { headers });
      }

      if (url.pathname === '/api/health') return json({ ok: true }, 200, cors);
      return new Response('Not found', { status: 404, headers: cors });
    } catch (err) {
      return json({ error: 'Server error' }, 500, cors);
    }
  }
};

function cleanSlug(value) {
  const s = String(value || '').toLowerCase();
  return /^[a-z0-9-]+$/.test(s) ? s : '';
}

function corsHeaders(origin, allowed) {
  const h = new Headers({
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Vary': 'Origin'
  });
  if (origin && origin === allowed) h.set('Access-Control-Allow-Origin', origin);
  return h;
}

function json(data, status, headers) {
  const h = new Headers(headers);
  h.set('Content-Type', 'application/json; charset=utf-8');
  h.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers: h });
}

async function listAll(bucket, prefix) {
  const out = [];
  let cursor;
  do {
    const page = await bucket.list({ prefix, cursor });
    out.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return out;
}

async function hmac(message, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

async function signAsset(message, secret) {
  return base64url(await hmac(message, secret));
}

async function signSession(payload, secret) {
  const body = base64url(enc.encode(JSON.stringify(payload)));
  const sig = base64url(await hmac(body, secret));
  return `${body}.${sig}`;
}

async function verifySession(token, secret) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = base64url(await hmac(body, secret));
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(dec.decode(base64urlDecode(body)));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

function safeEqual(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

function base64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const raw = atob(s);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}
