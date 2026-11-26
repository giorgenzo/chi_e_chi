import type { Club } from '../domain/types';

/** Stemma segnaposto: cerchio nei colori sociali con le iniziali. Mai loghi ufficiali. */
export function Stemma({ club, size = 40 }: { club: Pick<Club, 'colori' | 'sigla'>; size?: number }) {
  const [sfondo, testo] = club.colori;
  return (
    <span className="stemma" aria-hidden="true"
      style={{ width: size, height: size, background: sfondo, color: testo, fontSize: size * 0.36 }}>
      {club.sigla}
    </span>
  );
}

/** Logo dell'app: monogramma astratto (due anelli intrecciati), nessun testo. */
export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Logo">
      <circle cx="12" cy="16" r="7.5" fill="none" stroke="var(--accent)" strokeWidth="3" />
      <circle cx="20" cy="16" r="7.5" fill="none" stroke="var(--accent)" strokeWidth="3" opacity="0.55" />
    </svg>
  );
}
