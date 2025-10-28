// Manejo de borradores en sesión (no persiste en servidor)
const keyVariante = (productoId) => `cw:draft:variante:${productoId}`;
const keyColor = (productoId) => `cw:draft:color:${productoId}`;

export function saveVarianteDraft(productoId, data) {
  try {
    sessionStorage.setItem(keyVariante(productoId), JSON.stringify({ ...data, __t: Date.now() }));
  } catch (e) {
    console.warn('[drafts] saveVarianteDraft error', e);
  }
}

export function consumeVarianteDraft(productoId) {
  try {
    const k = keyVariante(productoId);
    const raw = sessionStorage.getItem(k);
    if (!raw) return null;
    sessionStorage.removeItem(k);
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[drafts] consumeVarianteDraft error', e);
    return null;
  }
}

export function saveColorDraft(productoId, data) {
  try {
    sessionStorage.setItem(keyColor(productoId), JSON.stringify({ ...data, __t: Date.now() }));
  } catch (e) {
    console.warn('[drafts] saveColorDraft error', e);
  }
}

export function consumeColorDraft(productoId) {
  try {
    const k = keyColor(productoId);
    const raw = sessionStorage.getItem(k);
    if (!raw) return null;
    sessionStorage.removeItem(k);
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[drafts] consumeColorDraft error', e);
    return null;
  }
}

export function clearAllDraftsForProducto(productoId) {
  try {
    sessionStorage.removeItem(keyVariante(productoId));
    sessionStorage.removeItem(keyColor(productoId));
  } catch (e) {
    console.warn('[drafts] clearAllDraftsForProducto error', e);
  }
}