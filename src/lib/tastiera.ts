import { useEffect, useState } from 'react';

function campoAttivo(): boolean {
  const el = document.activeElement;
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return false;
  return !(el instanceof HTMLInputElement) || !['radio', 'checkbox', 'button', 'submit'].includes(el.type);
}

/**
 * Stato della tastiera del telefono.
 * `aperta`: un campo di testo ha il fuoco.
 * `altezza`: quanto la tastiera copre il fondo dello schermo (dalla visualViewport),
 * per far salire il campo di ricerca sopra la tastiera su iPhone e Android.
 */
export function useTastiera() {
  const [aperta, setAperta] = useState(campoAttivo);
  const [altezza, setAltezza] = useState(0);

  useEffect(() => {
    const aggiornaFuoco = () => setAperta(campoAttivo());
    const fuori = () => setTimeout(aggiornaFuoco, 0); // il fuoco passa al prossimo elemento dopo focusout
    document.addEventListener('focusin', aggiornaFuoco);
    document.addEventListener('focusout', fuori);

    const vv = window.visualViewport;
    const misura = () => {
      if (!vv) return;
      setAltezza(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    };
    vv?.addEventListener('resize', misura);
    vv?.addEventListener('scroll', misura);
    misura();
    return () => {
      document.removeEventListener('focusin', aggiornaFuoco);
      document.removeEventListener('focusout', fuori);
      vv?.removeEventListener('resize', misura);
      vv?.removeEventListener('scroll', misura);
    };
  }, []);

  return { aperta, altezza: aperta ? altezza : 0 };
}
