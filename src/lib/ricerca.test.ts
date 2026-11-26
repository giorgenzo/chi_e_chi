import { describe, expect, it } from 'vitest';
import { cifreRicerca, normalizza, punteggio } from './ricerca';

describe('ricerca', () => {
  it('ignora accenti e maiuscole', () => {
    expect(normalizza('Niccolò  DELLA Valle')).toBe('niccolo della valle');
    expect(punteggio('niccolo', 'Niccolò Bassani')).toBe(0);
  });

  it('trova per inizio di parola', () => {
    expect(punteggio('ver', 'Hellas Verona')).not.toBeNull();
    expect(punteggio('hellas ver', 'Hellas Verona')).toBe(0);
  });

  it('tollera un errore di battitura', () => {
    expect(punteggio('novra', 'Novara')).not.toBeNull(); // lettera mancante
    expect(punteggio('nvoara', 'Novara')).not.toBeNull(); // lettere scambiate
    expect(punteggio('sampdroia', 'Sampdoria')).not.toBeNull();
    expect(punteggio('ceasre', 'De Cesare')).not.toBeNull();
  });

  it('non trova parole troppo diverse', () => {
    expect(punteggio('roma', 'Novara')).toBeNull();
    expect(punteggio('xyz', 'Inter')).toBeNull();
  });

  it('preferisce la corrispondenza esatta', () => {
    expect(punteggio('bari', 'Bari')!).toBeLessThan(punteggio('bara', 'Bari')!);
  });

  it('riconosce la ricerca per numero', () => {
    expect(cifreRicerca('4182')).toBe('4182');
    expect(cifreRicerca('333 12')).toBe('33312');
    expect(cifreRicerca('418')).toBeNull();
    expect(cifreRicerca('inter')).toBeNull();
  });
});
