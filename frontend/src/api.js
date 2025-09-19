import axios from 'axios';

export const BASE_URL = 'http://localhost:3001';
//export const BASE_URL = 'http://192.168.10.104:3001';

export async function fetchProductoPorCodigo(codigoVariante) {
  // Si el QR trae la URL completa, extraemos el último segmento
  let codigo = codigoVariante;
  try {
    const u = new URL(codigoVariante);
    const parts = u.pathname.split('/');
    codigo = parts[parts.length - 1] || codigoVariante;
  } catch (e) {
    // no es URL, dejar codigoVariante
  }
  const response = await axios.get(`${BASE_URL}/api/productos/${encodeURIComponent(codigo)}`);
  return response.data;
}