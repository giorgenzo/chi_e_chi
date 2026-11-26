import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDati } from '../data/dati';
import { RADICE_SEZIONE, sezioneDa, type Sezione, type StatoNav } from '../lib/navigazione';
import { novitaVista } from '../store/procuratore';
import { IconaNovita, IconaRecenti, IconaSquadre, IconaStella } from './Icone';

const VOCI: { sezione: Sezione; testo: string; Icona: typeof IconaSquadre }[] = [
  { sezione: 'squadre', testo: 'Squadre', Icona: IconaSquadre },
  { sezione: 'novita', testo: 'Novità', Icona: IconaNovita },
  { sezione: 'preferiti', testo: 'Preferiti', Icona: IconaStella },
  { sezione: 'recenti', testo: 'Recenti', Icona: IconaRecenti },
];

type Azione = 'radice' | 'inizio' | 'ricerca';

/** Evento per attivare la ricerca (3° tocco su Squadre): va gestito nello stesso tocco, così si apre la tastiera. */
export const EVENTO_ATTIVA_RICERCA = 'chiechi:attiva-ricerca';

/** Soglia dei Cambi non visti: ultima apertura delle Novità (al primo avvio, una settimana fa). */
export function sogliaNonVisti(vista: string | null): string {
  return vista ?? new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
}

export function useCambiNonVisti(): number {
  const novita = useDati('novita', (s) => s.novita());
  const soglia = sogliaNonVisti(novitaVista.use());
  return novita?.filter((n) => n.cambio.data > soglia).length ?? 0;
}

export function BarraBasso({ nascosta }: { nascosta: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const stato = (location.state as StatoNav | null) ?? {};
  const attiva = sezioneDa(location.pathname, stato);
  const nonVisti = useCambiNonVisti();
  const ultima = useRef<{ azione: Azione; t: number } | null>(null);

  const tocca = (s: Sezione) => {
    const radice = RADICE_SEZIONE[s];
    if (s !== attiva) {
      navigate(radice);
      return;
    }
    // Voce già attiva: 1° tocco → schermata principale, 2° → inizio lista, 3° (Squadre) → ricerca.
    const inRadice = location.pathname === radice && !location.search && !stato.pannello;
    const prima = ultima.current && Date.now() - ultima.current.t < 3000 ? ultima.current.azione : null;
    let azione: Azione;
    if (!inRadice) { navigate(radice); azione = 'radice'; }
    else if (window.scrollY > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); azione = 'inizio'; }
    else if (s === 'squadre' && prima !== 'radice') { window.dispatchEvent(new Event(EVENTO_ATTIVA_RICERCA)); azione = 'ricerca'; }
    else azione = 'inizio';
    ultima.current = { azione, t: Date.now() };
  };

  return (
    <nav className={`tabbar fisso${nascosta ? ' nascosta' : ''}`} aria-label="Sezioni">
      {VOCI.map(({ sezione, testo, Icona }) => {
        const on = sezione === attiva;
        return (
          <a key={sezione} href={`#${RADICE_SEZIONE[sezione]}`} className={on ? 'attiva' : ''}
            aria-current={on ? 'page' : undefined}
            onClick={(e) => { e.preventDefault(); tocca(sezione); }}>
            <span className="icona">
              <Icona piena={on} />
              {sezione === 'novita' && nonVisti > 0 && (
                <span className="pallino" aria-label={`${nonVisti} cambi non visti`}>{nonVisti}</span>
              )}
            </span>
            {testo}
          </a>
        );
      })}
    </nav>
  );
}
