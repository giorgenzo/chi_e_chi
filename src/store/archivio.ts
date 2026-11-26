import { useSyncExternalStore } from 'react';

/**
 * Archivio sul telefono (localStorage) per i dati del Procuratore.
 * Ogni lettura e scrittura è protetta: se il browser blocca lo spazio
 * (navigazione privata, spazio pieno) l'app continua a funzionare in memoria.
 */
const PREFISSO = 'chiechi:';

export function leggi<T>(chiave: string): T | undefined {
  try {
    const raw = window.localStorage.getItem(PREFISSO + chiave);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
}

export function scrivi<T>(chiave: string, valore: T): void {
  try {
    window.localStorage.setItem(PREFISSO + chiave, JSON.stringify(valore));
  } catch {
    /* spazio non disponibile: resta in memoria */
  }
}

export interface Archivio<T> {
  get(): T;
  set(valore: T | ((prima: T) => T)): void;
  subscribe(f: () => void): () => void;
  use(): T;
}

export function creaArchivio<T>(chiave: string, iniziale: () => T): Archivio<T> {
  let valore: T = leggi<T>(chiave) ?? iniziale();
  const ascoltatori = new Set<() => void>();
  const a: Archivio<T> = {
    get: () => valore,
    set(v) {
      valore = typeof v === 'function' ? (v as (p: T) => T)(valore) : v;
      scrivi(chiave, valore);
      ascoltatori.forEach((f) => f());
    },
    subscribe(f) {
      ascoltatori.add(f);
      return () => ascoltatori.delete(f);
    },
    use() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSyncExternalStore(a.subscribe, a.get);
    },
  };
  return a;
}

/** Valori che valgono solo finché la pagina è aperta (posizioni di scorrimento ecc.). */
export const memoria = new Map<string, unknown>();
