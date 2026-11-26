import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Incarico } from '../domain/types';
import type { Sezione, StatoNav } from './navigazione';

/**
 * Apre la scheda di un club ricordando la lista di provenienza (per sfogliare con lo swipe)
 * e, se serve, la persona da mostrare.
 */
export function useApriClub(sezione: Sezione) {
  const navigate = useNavigate();
  return useCallback(
    (clubId: string, sequenza: string[], etichetta: string, incarico?: Pick<Incarico, 'id' | 'area'>) => {
      const seq = sequenza.includes(clubId) ? sequenza : [clubId, ...sequenza];
      const stato: StatoNav = {
        sezione, sequenza: seq, etichetta,
        ...(incarico ? { tab: incarico.area, evidenzia: incarico.id } : {}),
      };
      navigate(`/club/${clubId}`, { state: stato });
    },
    [navigate, sezione],
  );
}

/** Club distinti, nell'ordine in cui compaiono. */
export function clubDistinti(ids: string[]): string[] {
  return [...new Set(ids)];
}
