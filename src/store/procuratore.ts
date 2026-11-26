import type { Categoria, Girone, Incarico } from '../domain/types';
import { creaArchivio } from './archivio';

// ---- Numeri aggiunti (ADR 0001) -------------------------------------------

export type TipoNumero = 'personale' | 'ruolo';

export interface NumeriAggiunti {
  /** Numero personale: segue la Persona (chiave = id Persona). */
  personali: Record<string, string>;
  /** Numero di ruolo: resta al Ruolo in quel Club (chiave = id Incarico). */
  diRuolo: Record<string, string>;
}

export const numeri = creaArchivio<NumeriAggiunti>('numeri', () => ({ personali: {}, diRuolo: {} }));

export interface NumeroTrovato {
  numero: string;
  tipo: TipoNumero;
}

/** Il numero da usare per una riga: prima il Numero personale, poi quello di ruolo. */
export function numeroPer(n: NumeriAggiunti, incarico: Pick<Incarico, 'id' | 'personaId'>): NumeroTrovato | undefined {
  const p = incarico.personaId ? n.personali[incarico.personaId] : undefined;
  if (p) return { numero: p, tipo: 'personale' };
  const r = n.diRuolo[incarico.id];
  if (r) return { numero: r, tipo: 'ruolo' };
  return undefined;
}

export function salvaNumero(tipo: TipoNumero, incarico: Pick<Incarico, 'id' | 'personaId'>, numero: string) {
  numeri.set((n) => {
    const personali = { ...n.personali };
    const diRuolo = { ...n.diRuolo };
    // Un solo numero per riga: cambiando tipo si toglie l'altro.
    if (incarico.personaId) delete personali[incarico.personaId];
    delete diRuolo[incarico.id];
    if (tipo === 'personale' && incarico.personaId) personali[incarico.personaId] = numero;
    else diRuolo[incarico.id] = numero;
    return { personali, diRuolo };
  });
}

export function cancellaNumero(tipo: TipoNumero, incarico: Pick<Incarico, 'id' | 'personaId'>) {
  numeri.set((n) => {
    const personali = { ...n.personali };
    const diRuolo = { ...n.diRuolo };
    if (tipo === 'personale' && incarico.personaId) delete personali[incarico.personaId];
    else delete diRuolo[incarico.id];
    return { personali, diRuolo };
  });
}

// ---- Preferiti ---------------------------------------------------------------

export interface Preferiti {
  persone: string[];
  club: string[];
}

export const preferiti = creaArchivio<Preferiti>('preferiti', () => ({ persone: [], club: [] }));

export function alternaPreferito(tipo: keyof Preferiti, id: string): boolean {
  let aggiunto = false;
  preferiti.set((p) => {
    const lista = p[tipo];
    aggiunto = !lista.includes(id);
    return { ...p, [tipo]: aggiunto ? [id, ...lista] : lista.filter((x) => x !== id) };
  });
  return aggiunto;
}

// ---- Recenti -------------------------------------------------------------------

export type Canale = 'chiamata' | 'whatsapp';

export interface Recente {
  id: string;
  canale: Canale;
  numero: string;
  /** ISO 8601. */
  quando: string;
  /** Persona contattata tramite un Numero aggiunto... */
  personaId?: string;
  /** ...con il Ruolo che ricopriva in quel momento (serve a ritrovare il Numero di ruolo). */
  incaricoId?: string;
  /** ...oppure Recapito del club. */
  clubId?: string;
}

export const recenti = creaArchivio<Recente[]>('recenti', () => []);

export function registraRecente(r: Omit<Recente, 'id' | 'quando'>) {
  const nuovo: Recente = { ...r, id: Math.random().toString(36).slice(2), quando: new Date().toISOString() };
  recenti.set((l) => [nuovo, ...l].slice(0, 100));
}

// ---- Ricerche recenti -----------------------------------------------------------

export const ricerche = creaArchivio<string[]>('ricerche', () => []);

export function ricordaRicerca(testo: string) {
  const t = testo.trim();
  if (!t) return;
  ricerche.set((l) => [t, ...l.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5));
}

// ---- Preferenze e stato dell'interfaccia ----------------------------------------------

export interface Filtro {
  categoria: Categoria;
  girone: Girone;
}

export const filtro = creaArchivio<Filtro>('filtro', () => ({ categoria: 'A', girone: 'A' }));

/** Ultima apertura della sezione Novità (ISO), per contare i Cambi non visti. */
export const novitaVista = creaArchivio<string | null>('novita-vista', () => null);

/** Il suggerimento dello swipe nella scheda club si vede una volta sola. */
export const suggerimentoSwipe = creaArchivio<boolean>('suggerimento-swipe', () => false);
