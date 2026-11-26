import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { DataService } from './DataService';

const DataContext = createContext<DataService | null>(null);

/**
 * Cache dei risultati del servizio dati: tornando su una schermata i dati
 * ci sono già, così la lista ritrova subito la sua posizione.
 */
const cache = new Map<string, unknown>();
let versione = 0;
const ascoltatori = new Set<() => void>();

/** Da chiamare dopo un Aggiornamento: le schermate rileggono i dati. */
export function invalidaDati() {
  cache.clear();
  versione++;
  ascoltatori.forEach((f) => f());
}

function useVersione() {
  return useSyncExternalStore(
    (f) => { ascoltatori.add(f); return () => ascoltatori.delete(f); },
    () => versione,
  );
}

export function DataProvider({ service, children }: { service: DataService; children: ReactNode }) {
  return <DataContext.Provider value={service}>{children}</DataContext.Provider>;
}

export function useDataService(): DataService {
  const s = useContext(DataContext);
  if (!s) throw new Error('DataProvider mancante');
  return s;
}

/** Legge un dato dal servizio. `chiave` identifica la richiesta nella cache. */
export function useDati<T>(chiave: string, leggi: (s: DataService) => Promise<T>): T | undefined {
  const service = useDataService();
  const v = useVersione();
  const [, setTick] = useState(0);
  const valore = cache.get(chiave) as T | undefined;

  useEffect(() => {
    if (cache.has(chiave)) return;
    let vivo = true;
    leggi(service).then((r) => {
      cache.set(chiave, r);
      if (vivo) setTick((t) => t + 1);
    });
    return () => { vivo = false; };
    // `leggi` cambia a ogni render: conta solo la chiave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave, service, v]);

  return valore;
}
