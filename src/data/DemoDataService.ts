import type { Area, Cambio, Club, Incarico, Persona, SchedaClub, SquadraGiovanile } from '../domain/types';
import type { CambioDettaglio, DataService, PersonaInRuolo } from './DataService';
import demo from './demo.json';

/**
 * Forma del file demo.json. Le date sono scritte come "giorni fa", così la demo
 * appare sempre aggiornata: vengono trasformate in date vere all'avvio.
 */
interface DemoFile {
  club: (Omit<Club, 'ultimoAggiornamento'> & { aggiornatoGiorniFa: number })[];
  persone: Persona[];
  incarichi: (Omit<Incarico, 'dal'> & { dalGiorniFa?: number })[];
  cambi: (Omit<Cambio, 'data'> & { giorniFa: number })[];
}

export function giorniFa(n: number, ora = new Date()): string {
  const d = new Date(ora);
  d.setDate(d.getDate() - n);
  if (n > 0) d.setHours(10, 30, 0, 0);
  return d.toISOString();
}

/** Simula il tempo di risposta di una verifica dei dati. */
const attesa = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class DemoDataService implements DataService {
  private readonly club: Club[];
  private readonly persone: Map<string, Persona>;
  private readonly incarichi: Incarico[];
  private readonly cambi: Cambio[];

  constructor(file: DemoFile = demo as DemoFile) {
    this.club = file.club
      .map(({ aggiornatoGiorniFa, ...c }) => ({ ...c, ultimoAggiornamento: giorniFa(aggiornatoGiorniFa) }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
    this.persone = new Map(file.persone.map((p) => [p.id, p]));
    this.incarichi = file.incarichi.map(({ dalGiorniFa, ...i }) =>
      dalGiorniFa === undefined ? i : { ...i, dal: giorniFa(dalGiorniFa) },
    );
    this.cambi = file.cambi
      .map(({ giorniFa: g, ...c }) => ({ ...c, data: giorniFa(g) }))
      .sort((a, b) => b.data.localeCompare(a.data));
  }

  async elencoClub(): Promise<Club[]> {
    return this.club.map((c) => ({ ...c }));
  }

  async schedaClub(clubId: string): Promise<SchedaClub | undefined> {
    const club = this.club.find((c) => c.id === clubId);
    if (!club) return undefined;
    const incarichi = this.incarichi.filter((i) => i.clubId === clubId);
    const persone: Record<string, Persona> = {};
    for (const i of incarichi) {
      const p = i.personaId ? this.persone.get(i.personaId) : undefined;
      if (p) persone[p.id] = p;
    }
    return { club: { ...club }, incarichi: ordinaIncarichi(incarichi, club.squadreGiovanili), persone };
  }

  async personeInRuolo(): Promise<PersonaInRuolo[]> {
    const clubById = new Map(this.club.map((c) => [c.id, c]));
    const out: PersonaInRuolo[] = [];
    for (const incarico of this.incarichi) {
      const persona = incarico.personaId ? this.persone.get(incarico.personaId) : undefined;
      const club = clubById.get(incarico.clubId);
      if (persona && club) out.push({ persona, incarico, club });
    }
    return out;
  }

  async persona(personaId: string): Promise<Persona | undefined> {
    return this.persone.get(personaId);
  }

  async novita(): Promise<CambioDettaglio[]> {
    const clubById = new Map(this.club.map((c) => [c.id, c]));
    return this.cambi.flatMap((cambio) => {
      const club = clubById.get(cambio.clubId);
      if (!club) return [];
      return [{
        cambio,
        club,
        persona: cambio.personaId ? this.persone.get(cambio.personaId) : undefined,
        precedente: cambio.precedentePersonaId ? this.persone.get(cambio.precedentePersonaId) : undefined,
      }];
    });
  }

  async aggiornaClub(clubId: string): Promise<string> {
    await attesa(900);
    const ora = new Date().toISOString();
    const club = this.club.find((c) => c.id === clubId);
    if (club) club.ultimoAggiornamento = ora;
    return ora;
  }

  async aggiornaTutto(): Promise<string> {
    await attesa(1400);
    const ora = new Date().toISOString();
    for (const c of this.club) c.ultimoAggiornamento = ora;
    return ora;
  }
}

const ORDINE_AREA: Area[] = ['prima-squadra', 'settore-giovanile'];
const ORDINE_RUOLI = [
  'Direttore sportivo', 'Direttore area tecnica', 'Responsabile scouting', 'Allenatore', 'Team manager', 'Segreteria sportiva',
  'Responsabile settore giovanile', 'Coordinatore tecnico', 'Responsabile scouting giovanile',
];

/** Ordine di lettura: Prima squadra, poi responsabili del vivaio, poi squadre giovanili, poi segreteria. */
function ordinaIncarichi(incarichi: Incarico[], squadre: SquadraGiovanile[]): Incarico[] {
  const peso = (i: Incarico) => {
    const area = ORDINE_AREA.indexOf(i.area) * 1000;
    if (i.ruolo === 'Segreteria settore giovanile') return area + 900;
    if (i.squadra) return area + 100 + squadre.indexOf(i.squadra);
    return area + ORDINE_RUOLI.indexOf(i.ruolo);
  };
  return [...incarichi].sort((a, b) => peso(a) - peso(b));
}
