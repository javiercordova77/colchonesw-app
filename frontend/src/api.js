import axios from 'axios';

//export const BASE_URL = 'http://localhost:3001';
export const BASE_URL = 'https://192.168.10.104:3001';

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

  console.debug('[API] fetchProductoPorCodigo -> codigo bruto:', codigoVariante);
  console.debug('[API] fetchProductoPorCodigo -> codigo limpio:', limpio);
  console.debug('[API] URL final:', url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    console.debug('[API] HTTP status:', res.status);
    if (!res.ok) {
      const text = await res.text().catch(() => '(no body)');
      console.error('[API] Respuesta no OK. Body:', text);
      throw new Error('HTTP ' + res.status);
    }
    const data = await res.json();
    console.debug('[API] JSON recibido:', data);
    return data;
  } catch (err) {
    console.error('[API] Network / Fetch error primario:', err);
    await new Promise(r => setTimeout(r, 150));
    try {
      console.debug('[API] Reintento fetch:', url);
      const res2 = await fetch(url);
      if (!res2.ok) throw new Error('HTTP ' + res2.status);
      const data2 = await res2.json();
      console.debug('[API] Reintento OK:', data2);
      return data2;
    } catch (err2) {
      console.error('[API] Reintento falló:', err2);
      throw err2;
    }
  }
}

// === NUEVO: LISTADO COMPLETO DE PRODUCTOS ===
export async function fetchProductosListado() {
  const url = `${BASE_URL}/api/productos`; // Debe devolver un array
  console.debug('[API] fetchProductosListado URL:', url);
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (e) {
    console.error('[API] Error de red listado:', e);
    throw e;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '(no body)');
    console.error('[API] Listado HTTP no OK:', res.status, text);
    throw new Error('HTTP ' + res.status);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.warn('[API] Respuesta listado no es array, envolviendo en array');
    return [];
  }
  return data;
}