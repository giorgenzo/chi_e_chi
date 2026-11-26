import { describe, expect, it } from 'vitest';
import { linkWhatsApp, normalizzaNumero } from './telefono';

describe('normalizzaNumero', () => {
  it.each([
    ['3331234567', '+39 333 123 4567'],
    ['333 123 4567', '+39 333 123 4567'],
    ['333-123-4567', '+39 333 123 4567'],
    ['+39 333 1234567', '+39 333 123 4567'],
    ['0039 333.123.4567', '+39 333 123 4567'],
    ['(+39) 333/12.34.567', '+39 333 123 4567'],
    ['02 1234 5678', '+39 02 1234 5678'],
    ['+44 7700 900123', '+44 770 090 0123'],
  ])('%s → %s', (input, atteso) => {
    expect(normalizzaNumero(input)).toBe(atteso);
  });

  it.each(['', 'abc', '123', '+39 12345', '33+31234567'])('rifiuta "%s"', (input) => {
    expect(normalizzaNumero(input)).toBeNull();
  });

  it('crea il link WhatsApp con sole cifre', () => {
    expect(linkWhatsApp('+39 333 123 4567')).toBe('https://wa.me/393331234567');
  });
});
