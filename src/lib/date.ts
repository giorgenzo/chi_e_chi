const GIORNO = 24 * 60 * 60 * 1000;

function inizioGiorno(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "oggi", "ieri", "3 giorni fa", "2 settimane fa", "12 mar". */
export function tempoFa(iso: string, ora = new Date()): string {
  const d = new Date(iso);
  const giorni = Math.round((inizioGiorno(ora) - inizioGiorno(d)) / GIORNO);
  if (giorni <= 0) {
    const minuti = Math.round((ora.getTime() - d.getTime()) / 60000);
    if (minuti < 1) return 'adesso';
    if (minuti < 60) return `${minuti} min fa`;
    return 'oggi';
  }
  if (giorni === 1) return 'ieri';
  if (giorni < 14) return `${giorni} giorni fa`;
  if (giorni < 60) return `${Math.floor(giorni / 7)} settimane fa`;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

/** Vero se la data è negli ultimi `giorni` giorni (etichetta NUOVO). */
export function recente(iso: string | undefined, giorni = 7, ora = new Date()): boolean {
  if (!iso) return false;
  return ora.getTime() - new Date(iso).getTime() < giorni * GIORNO;
}
