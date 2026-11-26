import { useCallback, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Area } from '../domain/types';
import { memoria } from '../store/archivio';

export type Sezione = 'squadre' | 'novita' | 'preferiti' | 'recenti';

export const RADICE_SEZIONE: Record<Sezione, string> = {
  squadre: '/squadre',
  novita: '/novita',
  preferiti: '/preferiti',
  recenti: '/recenti',
};

export type Pannello =
  | { tipo: 'menu'; incaricoId: string }
  | { tipo: 'numero'; incaricoId: string }
  | { tipo: 'recapito'; clubId: string };

/** Ciò che viaggia con ogni pagina nella cronologia del browser. */
export interface StatoNav {
  /** Sezione della barra in basso da cui si è arrivati. */
  sezione?: Sezione;
  /** Sequenza di club da sfogliare nella scheda (lista di provenienza). */
  sequenza?: string[];
  /** "Serie C Girone A", "Risultati", "Preferiti", "Novità". */
  etichetta?: string;
  /** Tab della scheda club. */
  tab?: Area;
  /** Incarico da mostrare ed evidenziare nella scheda (arrivando da ricerca, Preferiti, Novità). */
  evidenzia?: string;
  /** Pannello dal basso aperto sopra la pagina. */
  pannello?: Pannello;
}

export function useStatoNav(): StatoNav {
  return (useLocation().state as StatoNav | null) ?? {};
}

export function sezioneDa(pathname: string, stato: StatoNav): Sezione {
  if (pathname.startsWith('/novita')) return 'novita';
  if (pathname.startsWith('/preferiti')) return 'preferiti';
  if (pathname.startsWith('/recenti')) return 'recenti';
  if (pathname.startsWith('/club')) return stato.sezione ?? 'squadre';
  return 'squadre';
}

/** Quante pagine dell'app ci sono prima di questa nella cronologia. */
function indiceCronologia(): number {
  const s = window.history.state as { idx?: number } | null;
  return s?.idx ?? 0;
}

/** Freccia ‹ dell'app: come il tasto Indietro, ma se non c'è una pagina precedente va a Squadre. */
export function useIndietro() {
  const navigate = useNavigate();
  return useCallback(() => {
    if (indiceCronologia() > 0) navigate(-1);
    else navigate('/squadre', { replace: true });
  }, [navigate]);
}

/** Apre e chiude i pannelli dal basso: il tasto Indietro chiude prima il pannello. */
export function usePannello() {
  const navigate = useNavigate();
  const location = useLocation();
  const stato = (location.state as StatoNav | null) ?? {};
  const apri = useCallback(
    (p: Pannello, sostituisci = false) => {
      navigate(location.pathname + location.search, {
        state: { ...stato, pannello: p },
        replace: sostituisci && !!stato.pannello,
      });
    },
    [navigate, location.pathname, location.search, stato],
  );
  const chiudi = useCallback(() => {
    if (stato.pannello) navigate(-1);
  }, [navigate, stato.pannello]);
  return { aperto: stato.pannello, apri, chiudi };
}

/**
 * Il tasto Indietro non fa mai uscire dall'app per sbaglio.
 * Al primo tocco (serve un gesto dell'utente, altrimenti Chrome ignora la voce)
 * si mette una "guardia" prima della pagina iniziale: tornandoci, si va di nuovo avanti.
 */
export function installaGuardiaIndietro() {
  window.history.scrollRestoration = 'manual';
  const installa = () => {
    try {
      if (sessionStorage.getItem('chiechi:guardia')) return;
      sessionStorage.setItem('chiechi:guardia', '1');
    } catch { /* ok anche senza sessionStorage */ }
    const s = window.history.state as { idx?: number } | null;
    if ((s?.idx ?? 0) !== 0) return;
    const url = window.location.href;
    window.history.replaceState({ guardia: true }, '', url);
    window.history.pushState(s, '', url);
  };
  window.addEventListener('pointerdown', installa, { once: true, capture: true });
  window.addEventListener('popstate', () => {
    if ((window.history.state as { guardia?: boolean } | null)?.guardia) window.history.go(1);
  });
}

/**
 * Ricorda la posizione di scorrimento di una schermata e la ripristina al ritorno.
 * `pronta` va a true quando i contenuti sono disegnati.
 */
export function usePosizione(chiave: string, pronta: boolean) {
  useLayoutEffect(() => {
    if (!pronta) return;
    const y = (memoria.get('scroll:' + chiave) as number | undefined) ?? 0;
    window.scrollTo(0, y);
  }, [chiave, pronta]);

  useEffect(() => {
    if (!pronta) return;
    let raf = 0;
    const salva = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => memoria.set('scroll:' + chiave, window.scrollY));
    };
    window.addEventListener('scroll', salva, { passive: true });
    return () => { window.removeEventListener('scroll', salva); cancelAnimationFrame(raf); };
  }, [chiave, pronta]);
}

export function azzeraPosizione(chiave: string) {
  memoria.delete('scroll:' + chiave);
}
