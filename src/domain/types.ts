// Modello del dominio. I nomi seguono il glossario in CONTEXT.md.

export type Categoria = 'A' | 'B' | 'C';
export type Girone = 'A' | 'B' | 'C';

/** Le due aree di un Club. */
export type Area = 'prima-squadra' | 'settore-giovanile';

/** Squadre del Settore giovanile (quali esistono dipende dal Club). */
export type SquadraGiovanile = 'Primavera' | 'U18' | 'U17' | 'U16' | 'U15';

export type RuoloPrimaSquadra =
  | 'Direttore sportivo'
  | 'Direttore area tecnica'
  | 'Responsabile scouting'
  | 'Allenatore'
  | 'Team manager'
  | 'Segreteria sportiva';

export type RuoloSettoreGiovanile =
  | 'Responsabile settore giovanile'
  | 'Coordinatore tecnico'
  | 'Responsabile scouting giovanile'
  | 'Allenatore'
  | 'Segreteria settore giovanile';

export type Ruolo = RuoloPrimaSquadra | RuoloSettoreGiovanile;

/** Recapito del club: solo la segreteria del Settore giovanile (ADR 0001). */
export interface RecapitoClub {
  telefono: string;
  email: string;
}

export interface Club {
  id: string;
  nome: string;
  citta: string;
  categoria: Categoria;
  /** Solo per la Serie C. */
  girone?: Girone;
  /** Colori sociali per lo stemma segnaposto: [sfondo, iniziali]. */
  colori: [string, string];
  /** Iniziali mostrate nello stemma segnaposto. */
  sigla: string;
  squadreGiovanili: SquadraGiovanile[];
  recapito: RecapitoClub;
  /** ISO 8601. */
  ultimoAggiornamento: string;
}

export interface Persona {
  id: string;
  nome: string;
  cognome: string;
  email?: string;
}

/** Un Ruolo ricoperto (o vacante) in un Club. */
export interface Incarico {
  /** Identifica il posto (Club + Ruolo + squadra): serve al Numero di ruolo. */
  id: string;
  clubId: string;
  area: Area;
  ruolo: Ruolo;
  /** Solo per gli allenatori del Settore giovanile. */
  squadra?: SquadraGiovanile;
  /** Assente se il Ruolo è vacante. */
  personaId?: string;
  /** Da quando la Persona ricopre il Ruolo (ISO 8601). */
  dal?: string;
}

export type TipoCambio = 'nuovo-arrivo' | 'cambio' | 'ruolo-vacante';

export interface Cambio {
  id: string;
  tipo: TipoCambio;
  clubId: string;
  ruolo: Ruolo;
  area: Area;
  squadra?: SquadraGiovanile;
  /** Chi ricopre ora il Ruolo (assente se vacante). */
  personaId?: string;
  /** Chi lo ricopriva prima. */
  precedentePersonaId?: string;
  /** Per un "cambio": il Club o il Ruolo da cui arriva la Persona. */
  provenienza?: string;
  /** ISO 8601. */
  data: string;
}

/** Club con tutto ciò che serve alla scheda. */
export interface SchedaClub {
  club: Club;
  incarichi: Incarico[];
  persone: Record<string, Persona>;
}

export const NOMI_CATEGORIA: Record<Categoria, string> = {
  A: 'Serie A',
  B: 'Serie B',
  C: 'Serie C',
};

export function etichettaCategoria(club: Pick<Club, 'categoria' | 'girone'>): string {
  const base = NOMI_CATEGORIA[club.categoria];
  return club.girone ? `${base} Girone ${club.girone}` : base;
}

export function nomeCompleto(p: Pick<Persona, 'nome' | 'cognome'>): string {
  return `${p.nome} ${p.cognome}`;
}

/** "Direttore sportivo", oppure "Allenatore U17" per le squadre giovanili. */
export function etichettaRuolo(i: Pick<Incarico, 'ruolo' | 'squadra'>): string {
  return i.squadra ? `${i.ruolo} ${i.squadra}` : i.ruolo;
}
