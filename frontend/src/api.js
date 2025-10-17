import axios from 'axios'; // opcional: no se usa, puedes removerlo

// ================== BASE ==================
/* export const BASE_URL = 'http://localhost:3001'; */
export const BASE_URL = 'https://192.168.10.104:3001';

// ================== CACHE CORE ==================
const CACHE_PREFIX = 'cwcache:';

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

// ================== CACHE KEYS ==================
function cacheKeyProducto(codigo) {
  return `${CACHE_PREFIX}producto:${(codigo || '').toLowerCase()}`;
}
function cacheKeyListado(q = '', orden = 'nombre_asc') {
  return `${CACHE_PREFIX}listado:q=${(q || '').toLowerCase()}|orden=${orden}`;
}
function cacheKeyProductosResumen(q = '', orden = 'nombre_asc') {
  return `${CACHE_PREFIX}productos_resumen:q=${(q || '').toLowerCase()}|orden=${orden}`;
}
function cacheKeyProductoById(id) {
  return `${CACHE_PREFIX}producto_by_id:${id}`;
}
function cacheKeyVariantesResumen(idProducto, q = '', orden = 'medida_asc') {
  return `${CACHE_PREFIX}variantes_resumen:prod=${idProducto}|q=${(q || '').toLowerCase()}|orden=${orden}`;
}

// ================== CACHE HELPERS (EXPORTADOS) ==================
export function getCachedProducto(codigo, maxAgeMs) {
  return cacheGet(cacheKeyProducto(codigo), maxAgeMs);
}
export function getCachedListado({ q = '', orden = 'nombre_asc', maxAgeMs } = {}) {
  return cacheGet(cacheKeyListado(q, orden), maxAgeMs);
}
export function getCachedProductosResumen({ q = '', orden = 'nombre_asc', maxAgeMs } = {}) {
  return cacheGet(cacheKeyProductosResumen(q, orden), maxAgeMs);
}
export function getCachedProductoById(id, maxAgeMs) {
  return cacheGet(cacheKeyProductoById(id), maxAgeMs);
}
export function getCachedVariantesResumen({ idProducto, q = '', orden = 'medida_asc', maxAgeMs } = {}) {
  return cacheGet(cacheKeyVariantesResumen(idProducto, q, orden), maxAgeMs);
}

// setters internos de cache específicos
function setCachedProductoById(id, data) {
  cacheSet(cacheKeyProductoById(id), data);
}

// ================== UTILS ==================
function sanitizeCodigo(raw) {
  return (raw || '')
    .replace(/[\r\n\t]/g, '')
    .replace(/^"+|"+$/g, '')
    .trim();
}

export function getImagenUrl(nombre) {
  return nombre ? `${BASE_URL}/images/${nombre}` : '/logo.png';
}

// ================== API: DETALLE POR CÓDIGO DE VARIANTE ==================
export async function fetchProductoPorCodigo(codigoVariante) {
  const limpio = sanitizeCodigo(codigoVariante);
  // Antes: const path = `/api/productos/${encodeURIComponent(limpio)}`;
  const path = `/api/productos/codigo/${encodeURIComponent(limpio)}`;
  const url = `${BASE_URL}${path}`;

  console.debug('[API] fetchProductoPorCodigo URL:', url);
  try {
    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    if (!res.ok) {
      const text = await res.text().catch(() => '(no body)');
      console.error('[API] Detalle no OK:', res.status, text);
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

// ================== API: LISTADO (VARIANTES) ==================
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

// ================== API: PRODUCTOS RESUMEN ==================
export async function fetchProductosResumen({ q = '', orden = 'nombre_asc', signal } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (orden) params.set('orden', orden);
  const url = `${BASE_URL}/api/productos/resumen?${params.toString()}`;
  console.debug('[API] fetchProductosResumen URL:', url);
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`fetchProductosResumen failed: ${res.status} ${txt}`);
  }
  const data = await res.json();
  cacheSet(cacheKeyProductosResumen(q, orden), data);
  return data;
}

// ================== API: PRODUCTO POR ID ==================
export async function fetchProductoById(id, { signal } = {}) {
  const url = `${BASE_URL}/api/productos/${id}`;
  console.debug('[API] fetchProductoById URL:', url);
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '(no body)');
    throw new Error(`fetchProductoById ${id} failed: ${res.status} ${txt}`);
  }
  const data = await res.json();
  setCachedProductoById(id, data);
  return data;
}

// ================== API: VARIANTES RESUMEN POR PRODUCTO ==================
export async function fetchVariantesResumen({ idProducto, q = '', orden = 'medida_asc', signal } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (orden) params.set('orden', orden);
  const url = `${BASE_URL}/api/productos/${idProducto}/variantes/resumen?${params.toString()}`;
  console.debug('[API] fetchVariantesResumen URL:', url);
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '(no body)');
    throw new Error(`fetchVariantesResumen failed: ${res.status} ${txt}`);
  }
  const data = await res.json();
  cacheSet(cacheKeyVariantesResumen(idProducto, q, orden), data);
  return data;
}


// ===== API: Edición de producto (+producto) =====
export async function fetchProductoEdicion(id, { signal } = {}) {
  const url = `${BASE_URL}/api/productos/${id}/editar`;
  console.debug('[API] fetchProductoEdicion URL:', url);
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`fetchProductoEdicion failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function updateProducto(id, payload) {
  const url = `${BASE_URL}/api/productos/${id}`;
  console.debug('[API] updateProducto URL:', url);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`updateProducto failed: ${res.status} ${txt}`);
  }
  return res.json();
}