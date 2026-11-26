/**
 * Ricerca tollerante: ignora accenti e maiuscole e accetta un piccolo
 * errore di battitura (una lettera sbagliata, mancante, in più o scambiata).
 */

export function normalizza(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Distanza di Damerau-Levenshtein (versione con scambio di lettere vicine). */
export function distanza(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + costo);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

/** Quanto bene un pezzo della ricerca corrisponde a una parola: 0 = inizio esatto, 1 = con un errore. */
function corrispondenzaParola(pezzo: string, parola: string): number | null {
  if (parola.startsWith(pezzo)) return 0;
  if (pezzo.length < 4) return null;
  // Un errore ammesso: sulla parola intera o sul suo inizio (lungo quanto il pezzo, ±1).
  if (distanza(pezzo, parola) <= 1) return 1;
  for (const l of [pezzo.length - 1, pezzo.length, pezzo.length + 1]) {
    if (l > 0 && l <= parola.length && distanza(pezzo, parola.slice(0, l)) <= 1) return 1;
  }
  return null;
}

/**
 * Punteggio di un testo rispetto alla ricerca (più basso = migliore),
 * oppure null se non corrisponde. Ogni parola cercata deve trovare una parola del testo.
 */
export function punteggio(ricerca: string, testo: string): number | null {
  const q = normalizza(ricerca);
  if (!q) return null;
  const t = normalizza(testo);
  if (t.startsWith(q)) return 0;
  const parole = t.split(' ');
  let totale = t.includes(q) ? 0 : 0.5;
  for (const pezzo of q.split(' ')) {
    let migliore: number | null = null;
    for (const parola of parole) {
      const c = corrispondenzaParola(pezzo, parola);
      if (c !== null && (migliore === null || c < migliore)) migliore = c;
      if (migliore === 0) break;
    }
    if (migliore === null) return null;
    totale += migliore;
  }
  return totale;
}

/** Le cifre di una ricerca, se è una ricerca per numero (almeno 4 cifre e nient'altro). */
export function cifreRicerca(ricerca: string): string | null {
  const s = ricerca.replace(/[\s+\-./()]/g, '');
  return /^\d{4,}$/.test(s) ? s : null;
}
