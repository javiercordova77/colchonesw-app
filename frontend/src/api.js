import axios from 'axios';

// export const BASE_URL = 'http://localhost:3001';
export const BASE_URL = 'https://192.168.10.104:3001';

// ===== Cache simple en localStorage =====
const CACHE_PREFIX = 'cwcache:';
function cacheKeyProducto(codigo) {
  return `${CACHE_PREFIX}producto:${(codigo || '').toLowerCase()}`;
}
function cacheKeyListado(q = '', orden = 'nombre_asc') {
  return `${CACHE_PREFIX}listado:q=${(q || '').toLowerCase()}|orden=${orden}`;
}
function cacheSet(key, value) {
  try {
    const payload = { ts: Date.now(), value };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {}
}
function cacheGet(key, maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.ts !== 'number') return null;
    if (Date.now() - obj.ts > maxAgeMs) return null;
    return obj.value;
  } catch {
    return null;
  }
}

// Helpers para leer cache desde componentes (mostrar algo offline)
export function getCachedProducto(codigo, maxAgeMs) {
  return cacheGet(cacheKeyProducto(codigo), maxAgeMs);
}
export function getCachedListado({ q = '', orden = 'nombre_asc', maxAgeMs } = {}) {
  return cacheGet(cacheKeyListado(q, orden), maxAgeMs);
}

function sanitizeCodigo(raw) {
  return (raw || '')
    .replace(/[\r\n\t]/g, '')
    .replace(/^"+|"+$/g, '')
    .trim();
}

export async function fetchProductoPorCodigo(codigoVariante) {
  const limpio = sanitizeCodigo(codigoVariante);
  const path = `/api/productos/${encodeURIComponent(limpio)}`;
  const url = `${BASE_URL}${path}`;

  console.debug('[API] fetchProductoPorCodigo URL:', url);
  try {
    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!res.ok) {
      const text = await res.text().catch(() => '(no body)');
      console.error('[API] Detalle no OK:', res.status, text);
      // Fallback a cache si existe
      const cached = getCachedProducto(limpio);
      if (cached) return cached;
      throw new Error('HTTP ' + res.status);
    }
    const data = await res.json();
    cacheSet(cacheKeyProducto(limpio), data);
    return data;
  } catch (err) {
    console.error('[API] Error detalle:', err);
    const cached = getCachedProducto(limpio);
    if (cached) return cached;
    throw err;
  }
}

// Listado con soporte de búsqueda/orden y cache
export async function fetchProductosListado({ q = '', orden = 'nombre_asc' } = {}) {
  const params = new URLSearchParams();
  if (q && q.trim()) params.set('q', q.trim());
  if (orden) params.set('orden', orden);
  const qs = params.toString();
  const url = `${BASE_URL}/api/productos${qs ? `?${qs}` : ''}`;

  console.debug('[API] fetchProductosListado URL:', url);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      const text = await res.text().catch(() => '(no body)');
      console.error('[API] Listado no OK:', res.status, text);
      const cached = getCachedListado({ q, orden });
      if (cached) return cached;
      throw new Error('HTTP ' + res.status);
    }
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    cacheSet(cacheKeyListado(q, orden), arr);
    return arr;
  } catch (e) {
    console.error('[API] Error listado:', e);
    const cached = getCachedListado({ q, orden });
    if (cached) return cached;
    throw e;
  }
}

export function getImagenUrl(nombre) {
  return nombre ? `${BASE_URL}/images/${nombre}` : '/logo.png';
}