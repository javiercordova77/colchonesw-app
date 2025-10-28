const DEV = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

export function focusHandlers(name) {
  const onFocus = (e) => {
    if (DEV) console.log(`[FOCUS] ${name}`, { t: Date.now(), value: e.target?.value, active: document.activeElement?.tagName });
  };
  const onBlur = (e) => {
    if (DEV) console.log(`[BLUR] ${name}`, {
      t: Date.now(),
      value: e.target?.value,
      related: e.relatedTarget?.tagName,
      active: document.activeElement?.tagName,
    });
  };
  const onInput = (e) => {
    if (DEV) console.log(`[INPUT] ${name}`, { type: e?.nativeEvent?.inputType, value: e.target?.value });
    Promise.resolve().then(() => {
      if (DEV) {
        const ae = document.activeElement;
        console.log(`[ACTIVE AFTER INPUT] ${name}`, { active: ae?.tagName, ae });
      }
    });
  };
  const onKeyDown = (e) => { if (DEV) console.log(`[KEY] ${name}`, e.key); };
  return { onFocus, onBlur, onInput, onKeyDown };
}

export function logMount(name) {
  if (DEV) console.log(`[MOUNT] ${name}`);
  return () => { if (DEV) console.log(`[UNMOUNT] ${name}`); };
}

export function logRender(name, ref) {
  ref.current = (ref.current || 0) + 1;
  if (DEV) console.log(`[RENDER] ${name} #${ref.current}`);
}