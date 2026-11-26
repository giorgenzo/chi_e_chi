import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface Messaggio {
  id: number;
  testo: string;
  annulla?: () => void;
}

interface ToastApi {
  /** Messaggio breve (2,5 s): "Dati aggiornati", "Numero salvato". */
  mostra(testo: string): void;
  /** Messaggio con ANNULLA (5 s): l'azione è già avvenuta, Annulla la ripristina. */
  conAnnulla(testo: string, annulla: () => void): void;
}

const Ctx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const c = useContext(Ctx);
  if (!c) throw new Error('ToastProvider mancante');
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<Messaggio | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const contatore = useRef(0);

  const apri = useCallback((m: Omit<Messaggio, 'id'>, durata: number) => {
    window.clearTimeout(timer.current);
    const id = ++contatore.current;
    setMsg({ ...m, id });
    timer.current = window.setTimeout(() => setMsg((x) => (x?.id === id ? null : x)), durata);
  }, []);

  const api = useRef<ToastApi>({
    mostra: (testo) => apri({ testo }, 2500),
    conAnnulla: (testo, annulla) => apri({ testo, annulla }, 5000),
  }).current;

  return (
    <Ctx.Provider value={api}>
      {children}
      <ToastVista msg={msg} chiudi={() => setMsg(null)} />
    </Ctx.Provider>
  );
}

function ToastVista({ msg, chiudi }: { msg: Messaggio | null; chiudi: () => void }) {
  const { pathname } = useLocation();
  // Sopra il campo di ricerca nella schermata Squadre.
  const alto = pathname === '/squadre' || pathname === '/';
  return (
    <div className={`toast-wrap fisso${alto ? ' alto' : ''}`} role="status" aria-live="polite">
      {msg && (
        <div className="toast" key={msg.id}>
          <span className="testo">{msg.testo}</span>
          {msg.annulla && (
            <button className="annulla" onClick={() => { msg.annulla!(); chiudi(); }}>ANNULLA</button>
          )}
        </div>
      )}
    </div>
  );
}
