/**
 * Numeri di telefono: accettati in qualsiasi formato, salvati e mostrati
 * come "+39 333 123 4567". Il formato unico serve a WhatsApp (wa.me) e
 * alla ricerca per cifre.
 */

/** Restituisce il numero normalizzato, oppure null se non è un numero valido. */
export function normalizzaNumero(input: string): string | null {
  let s = input.trim().replace(/[^\d+]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (s.indexOf('+') > 0 || (s.match(/\+/g)?.length ?? 0) > 1) return null;

  if (!s.startsWith('+')) {
    // Senza prefisso internazionale: numero italiano.
    s = '+39' + s;
  }
  const cifre = s.slice(1);
  if (cifre.startsWith('39')) {
    const nazionale = cifre.slice(2);
    if (!/^[03]\d{5,10}$/.test(nazionale)) return null;
    return '+39 ' + raggruppaItaliano(nazionale);
  }
  // Numero estero: prefisso del Paese + resto a gruppi di 3 (raggruppamento solo visivo).
  if (!/^\d{8,15}$/.test(cifre)) return null;
  const pref = lunghezzaPrefisso(cifre);
  return `+${cifre.slice(0, pref)} ${gruppi(cifre.slice(pref), 3)}`;
}

function raggruppaItaliano(n: string): string {
  if (n.startsWith('3')) {
    // Cellulare: 333 123 4567
    return [n.slice(0, 3), n.slice(3, 6), n.slice(6)].filter(Boolean).join(' ');
  }
  // Fisso: prefisso (02 e 06 a 2 cifre, gli altri a 3: è solo un raggruppamento visivo) + resto.
  const lp = /^0[26]/.test(n) ? 2 : 3;
  const resto = n.slice(lp);
  const r = resto.length > 4 ? [resto.slice(0, resto.length - 4), resto.slice(-4)] : [resto];
  return [n.slice(0, lp), ...r].join(' ');
}

/** Prefissi internazionali a 3 cifre (per i primi due caratteri); 1 e 7 sono a una cifra. */
const PREFISSI_3 = ['21', '22', '23', '24', '25', '26', '29', '35', '37', '38', '42', '50', '59', '67', '68', '69', '85', '88', '96', '97', '99'];

function lunghezzaPrefisso(cifre: string): number {
  if (cifre.startsWith('1') || cifre.startsWith('7')) return 1;
  return PREFISSI_3.includes(cifre.slice(0, 2)) ? 3 : 2;
}

/** Gruppi di n cifre; un'ultima cifra rimasta sola si unisce al gruppo precedente. */
function gruppi(s: string, n: number): string {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  if (out.length > 1 && out[out.length - 1].length === 1) {
    const ultima = out.pop()!;
    out[out.length - 1] += ultima;
  }
  return out.join(' ');
}

/** Solo cifre (con prefisso internazionale): "393331234567". */
export function soloCifre(numero: string): string {
  return numero.replace(/\D/g, '');
}

export function linkChiamata(numero: string): string {
  return 'tel:+' + soloCifre(numero);
}

export function linkWhatsApp(numero: string): string {
  return 'https://wa.me/' + soloCifre(numero);
}
