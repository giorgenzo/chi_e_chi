import type { PersonaInRuolo } from '../data/DataService';
import type { Club } from '../domain/types';
import type { NumeriAggiunti } from '../store/procuratore';
import { cifreRicerca, punteggio } from './ricerca';
import { soloCifre } from './telefono';

export interface RisultatoNumero {
  numero: string;
  tipo: 'personale' | 'ruolo' | 'recapito';
  club: Club;
  /** Assente per il Recapito del club. */
  voce?: PersonaInRuolo;
}

export interface Risultati {
  club: Club[];
  persone: PersonaInRuolo[];
  numeri: RisultatoNumero[];
}

const MAX_PERSONE = 25;

/**
 * Ricerca unica: con lettere cerca club e persone, con almeno 4 cifre cerca tra i numeri
 * (Numeri aggiunti e Recapiti del club: l'app non fornisce altri numeri).
 */
export function cerca(testo: string, clubs: Club[], indice: PersonaInRuolo[], n: NumeriAggiunti): Risultati {
  const vuoti: Risultati = { club: [], persone: [], numeri: [] };
  if (!testo.trim()) return vuoti;

  const cifre = cifreRicerca(testo);
  if (cifre) {
    const trova = (numero: string) => soloCifre(numero).includes(cifre) || soloCifre(numero).slice(2).includes(cifre);
    const numeri: RisultatoNumero[] = [];
    for (const [personaId, numero] of Object.entries(n.personali)) {
      const voce = indice.find((v) => v.persona.id === personaId);
      if (voce && trova(numero)) numeri.push({ numero, tipo: 'personale', club: voce.club, voce });
    }
    for (const [incaricoId, numero] of Object.entries(n.diRuolo)) {
      const voce = indice.find((v) => v.incarico.id === incaricoId);
      if (voce && trova(numero)) numeri.push({ numero, tipo: 'ruolo', club: voce.club, voce });
    }
    for (const club of clubs) {
      if (trova(club.recapito.telefono)) numeri.push({ numero: club.recapito.telefono, tipo: 'recapito', club });
    }
    return { ...vuoti, numeri };
  }

  const club = clubs
    .map((c) => ({ c, p: Math.min(punteggio(testo, c.nome) ?? 99, (punteggio(testo, c.citta) ?? 99) + 0.25) }))
    .filter((x) => x.p < 99)
    .sort((a, b) => a.p - b.p || a.c.nome.localeCompare(b.c.nome, 'it'))
    .map((x) => x.c);

  const persone = indice
    .map((v) => {
      const { nome, cognome } = v.persona;
      const p = Math.min(punteggio(testo, `${nome} ${cognome}`) ?? 99, punteggio(testo, `${cognome} ${nome}`) ?? 99);
      return { v, p };
    })
    .filter((x) => x.p < 99)
    .sort((a, b) => a.p - b.p || a.v.persona.cognome.localeCompare(b.v.persona.cognome, 'it'))
    .slice(0, MAX_PERSONE)
    .map((x) => x.v);

  return { club, persone, numeri: [] };
}
