import type { Cambio, Club, Incarico, Persona, SchedaClub } from '../domain/types';

/** Persona con il Ruolo che ricopre e il suo Club. */
export interface PersonaInRuolo {
  persona: Persona;
  incarico: Incarico;
  club: Club;
}

/** Cambio con Club e Persone già risolti, pronto da mostrare. */
export interface CambioDettaglio {
  cambio: Cambio;
  club: Club;
  persona?: Persona;
  precedente?: Persona;
}

/**
 * Unico punto da cui le schermate leggono i dati forniti dall'app.
 * Nella demo l'implementazione legge un file JSON; nell'app vera chiamerà il backend.
 * I dati del Procuratore (numeri, Preferiti, Recenti) NON passano da qui: stanno sul telefono.
 */
export interface DataService {
  elencoClub(): Promise<Club[]>;
  schedaClub(clubId: string): Promise<SchedaClub | undefined>;
  /** Tutte le Persone che ricoprono un Ruolo (per ricerca, Preferiti, Recenti). */
  personeInRuolo(): Promise<PersonaInRuolo[]>;
  /** Persone che non ricoprono più un Ruolo, ma servono (es. nelle Novità). */
  persona(personaId: string): Promise<Persona | undefined>;
  /** Novità: Cambi dal più recente. */
  novita(): Promise<CambioDettaglio[]>;
  /** Chiede di riverificare un Club. Restituisce il nuovo Ultimo aggiornamento (ISO). */
  aggiornaClub(clubId: string): Promise<string>;
  /** Chiede di riverificare tutti i Club. */
  aggiornaTutto(): Promise<string>;
}
