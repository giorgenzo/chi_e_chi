import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IconaAggiorna, IconaAltro, IconaAvanti, IconaEmail, IconaIndietro, IconaStella } from '../components/Icone';
import { RigaPersona } from '../components/RigaPersona';
import { Stemma } from '../components/Stemma';
import { TastiContatto } from '../components/TastiContatto';
import { useToast } from '../components/Toast';
import { invalidaDati, useDataService, useDati } from '../data/dati';
import { etichettaCategoria, type Area, type Club, type Incarico, type SchedaClub as Scheda } from '../domain/types';
import { tempoFa } from '../lib/date';
import { useIndietro, usePannello, useStatoNav, type StatoNav } from '../lib/navigazione';
import { memoria } from '../store/archivio';
import { alternaPreferito, preferiti, suggerimentoSwipe } from '../store/procuratore';

/** Lo swipe che parte entro questa distanza dal bordo è "indietro" (lo gestisce il telefono). */
const BORDO = 24;

export function SchedaClub() {
  const { id = '' } = useParams();
  const stato = useStatoNav();
  const scheda = useDati(`scheda:${id}`, (s) => s.schedaClub(id));
  const clubs = useDati('club', (s) => s.elencoClub());
  const navigate = useNavigate();
  const location = useLocation();
  const indietro = useIndietro();

  // Sequenza da sfogliare: quella della lista di provenienza, altrimenti la categoria del club.
  const { sequenza, etichetta } = useMemo(() => {
    if (stato.sequenza?.includes(id)) return { sequenza: stato.sequenza, etichetta: stato.etichetta ?? '' };
    const c = clubs?.find((x) => x.id === id);
    if (!c || !clubs) return { sequenza: [id], etichetta: '' };
    return {
      sequenza: clubs.filter((x) => x.categoria === c.categoria && x.girone === c.girone).map((x) => x.id),
      etichetta: etichettaCategoria(c),
    };
  }, [stato.sequenza, stato.etichetta, clubs, id]);
  const pos = sequenza.indexOf(id);
  const precedente = pos > 0 ? sequenza[pos - 1] : undefined;
  const successivo = pos >= 0 && pos < sequenza.length - 1 ? sequenza[pos + 1] : undefined;
  const tab: Area = stato.tab ?? 'prima-squadra';

  const [ingresso, setIngresso] = useState<'da-destra' | 'da-sinistra' | 'normale'>('normale');

  const vaiA = (altro: string | undefined, verso: 'avanti' | 'indietro') => {
    if (!altro) return;
    setIngresso(verso === 'avanti' ? 'da-destra' : 'da-sinistra');
    memoria.set('evidenzia-club', { id: altro, etichetta });
    navigate(`/club/${altro}`, {
      replace: true,
      state: { ...stato, sequenza, etichetta, tab, evidenzia: undefined, pannello: undefined } satisfies StatoNav,
    });
  };

  const cambiaTab = (t: Area) => {
    navigate(location.pathname, { replace: true, state: { ...stato, tab: t, evidenzia: undefined } satisfies StatoNav });
  };

  // Nuovo club: si riparte dall'alto.
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [id]);

  const swipe = useSwipe({
    puoAvanti: !!successivo,
    puoIndietro: !!precedente,
    onAvanti: () => vaiA(successivo, 'avanti'),
    onIndietro: () => vaiA(precedente, 'indietro'),
  });

  // Suggerimento: la prima volta la scheda accenna uno scivolamento laterale.
  const [accenno, setAccenno] = useState(false);
  useEffect(() => {
    if (!scheda || sequenza.length < 2 || suggerimentoSwipe.get()) return;
    const t = setTimeout(() => { setAccenno(true); suggerimentoSwipe.set(true); }, 700);
    return () => clearTimeout(t);
  }, [scheda, sequenza.length]);

  if (scheda === undefined && clubs === undefined) return <main className="schermata" />;
  if (!scheda) {
    return (
      <main className="schermata">
        <header className="testata">
          <button className="tasto-icona" aria-label="Indietro" onClick={indietro}><IconaIndietro /></button>
        </header>
        <p className="nessun-risultato">Club non trovato.</p>
      </main>
    );
  }

  return (
    <main className="schermata" style={{ overflowX: 'clip' }}>
      <header className="testata">
        <button className="tasto-icona" aria-label="Indietro" onClick={indietro}><IconaIndietro /></button>
        <div className="spazio" />
        <StellaClub club={scheda.club} />
      </header>

      <div
        key={id}
        className={`swipe-area ${ingresso === 'normale' ? 'entra' : `entra-${ingresso}`}${accenno ? ' accenno' : ''}`}
        onAnimationEnd={() => setAccenno(false)}
        {...swipe.gestori}
        style={swipe.stile}
      >
        <Testa scheda={scheda} />

        {sequenza.length > 1 && (
          <nav className="sfoglia" aria-label="Sfoglia i club">
            <button className="tasto-icona" aria-label="Club precedente" disabled={!precedente} onClick={() => vaiA(precedente, 'indietro')}>
              <IconaIndietro />
            </button>
            <span className="posizione" aria-live="polite">{pos + 1} di {sequenza.length}{etichetta ? ` · ${etichetta}` : ''}</span>
            <button className="tasto-icona" aria-label="Club successivo" disabled={!successivo} onClick={() => vaiA(successivo, 'avanti')}>
              <IconaAvanti />
            </button>
          </nav>
        )}

        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'prima-squadra'} onClick={() => cambiaTab('prima-squadra')}>Prima squadra</button>
          <button role="tab" aria-selected={tab === 'settore-giovanile'} onClick={() => cambiaTab('settore-giovanile')}>Settore giovanile</button>
        </div>

        <div role="tabpanel">
          {tab === 'prima-squadra'
            ? <PrimaSquadra scheda={scheda} />
            : <SettoreGiovanile scheda={scheda} />}
        </div>
      </div>
      <Evidenzia />
    </main>
  );
}

function StellaClub({ club }: { club: Club }) {
  const pref = preferiti.use();
  const toast = useToast();
  const on = pref.club.includes(club.id);
  return (
    <button className="tasto-icona stella" aria-pressed={on}
      aria-label={on ? `Togli ${club.nome} dai Preferiti` : `Aggiungi ${club.nome} ai Preferiti`}
      onClick={() => {
        if (!alternaPreferito('club', club.id)) toast.conAnnulla('Tolto dai Preferiti', () => alternaPreferito('club', club.id));
      }}>
      <IconaStella piena={on} />
    </button>
  );
}

function Testa({ scheda }: { scheda: Scheda }) {
  const { club } = scheda;
  const service = useDataService();
  const toast = useToast();
  const [aggiornando, setAggiornando] = useState(false);
  return (
    <div className="scheda-testa">
      <Stemma club={club} size={56} />
      <div className="info">
        <h1 className="titolo">{club.nome}</h1>
        <div className="meta">{etichettaCategoria(club)} · {club.citta}</div>
        <div className="meta aggiornato">
          Aggiornato {tempoFa(club.ultimoAggiornamento)}
          <button className={`tasto-icona${aggiornando ? ' ruota' : ''}`} aria-label="Aggiorna questo club" disabled={aggiornando}
            onClick={async () => {
              setAggiornando(true);
              await service.aggiornaClub(club.id);
              invalidaDati();
              setAggiornando(false);
              toast.mostra('Dati aggiornati');
            }}>
            <IconaAggiorna size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Blocco({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="etichetta sezione">{titolo}</h2>
      <div className="blocco">{children}</div>
    </section>
  );
}

function righe(scheda: Scheda, incarichi: Incarico[]) {
  return incarichi.map((i) => (
    <RigaPersona key={i.id} incarico={i} club={scheda.club} persona={i.personaId ? scheda.persone[i.personaId] : undefined} />
  ));
}

function PrimaSquadra({ scheda }: { scheda: Scheda }) {
  const incarichi = scheda.incarichi.filter((i) => i.area === 'prima-squadra');
  return <Blocco titolo="Prima squadra">{righe(scheda, incarichi)}</Blocco>;
}

function SettoreGiovanile({ scheda }: { scheda: Scheda }) {
  const sg = scheda.incarichi.filter((i) => i.area === 'settore-giovanile');
  const responsabili = sg.filter((i) => !i.squadra && i.ruolo !== 'Segreteria settore giovanile');
  const segreteria = sg.filter((i) => i.ruolo === 'Segreteria settore giovanile');
  return (
    <>
      <Blocco titolo="Responsabili">{righe(scheda, responsabili)}</Blocco>
      {scheda.club.squadreGiovanili.map((sq) => {
        const lista = sg.filter((i) => i.squadra === sq);
        return lista.length ? <Blocco key={sq} titolo={sq}>{righe(scheda, lista)}</Blocco> : null;
      })}
      <Blocco titolo="Segreteria">
        {righe(scheda, segreteria)}
        <Recapito club={scheda.club} />
      </Blocco>
    </>
  );
}

/** Recapito del club: telefono ed email della segreteria del Settore giovanile (unico recapito fornito). */
function Recapito({ club }: { club: Club }) {
  const { apri } = usePannello();
  return (
    <div className="riga" id={`incarico-recapito-${club.id}`}>
      <div className="corpo">
        <div className="ruolo">Recapito del club</div>
        <div className="nome numero" style={{ fontSize: 'var(--fs-15)' }}>{club.recapito.telefono}</div>
        <div className="dettaglio" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{club.recapito.email}</div>
      </div>
      <div className="azioni">
        <TastiContatto numero={club.recapito.telefono} chi={`la segreteria del ${club.nome}`} soggetto={{ clubId: club.id }} soloChiama />
        <a className="tasto-contorno icona tocco" href={`mailto:${club.recapito.email}`} aria-label={`Email alla segreteria del ${club.nome}`}>
          <IconaEmail size={20} />
        </a>
        <button className="tasto-altro" aria-label="Altre azioni per il recapito" onClick={() => apri({ tipo: 'recapito', clubId: club.id })}>
          <IconaAltro size={22} />
        </button>
      </div>
    </div>
  );
}

/** Arrivando da ricerca, Preferiti o Novità: porta la persona in vista e la evidenzia per un attimo. */
function Evidenzia() {
  const stato = useStatoNav();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!stato.evidenzia) return;
    const el = document.getElementById(`incarico-${stato.evidenzia}`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 90 || r.top < 60) {
      window.scrollTo({ top: window.scrollY + r.top - window.innerHeight / 3 });
    }
    el.classList.add('evidenziata');
    setTimeout(() => el.classList.remove('evidenziata'), 80);
    // Fatto una volta: chiudendo un pannello non si ripete.
    navigate(location.pathname, { replace: true, state: { ...stato, evidenzia: undefined } });
  }, [stato, navigate, location.pathname]);
  return null;
}

/**
 * Swipe orizzontale tra club: segue il dito, al rilascio passa al club vicino.
 * Ignora i tocchi che partono dal bordo (lì è "indietro") e i movimenti verticali.
 */
function useSwipe(o: { puoAvanti: boolean; puoIndietro: boolean; onAvanti: () => void; onIndietro: () => void }) {
  const [dx, setDx] = useState(0);
  const [rilascio, setRilascio] = useState(false);
  const g = useRef<{ x: number; y: number; t: number; dir: 'h' | 'v' | null; id: number } | null>(null);
  const trascinato = useRef(false);

  const fine = (e: React.PointerEvent) => {
    const s = g.current;
    g.current = null;
    if (!s || s.dir !== 'h') return;
    const d = e.clientX - s.x;
    const v = Math.abs(d) / Math.max(1, e.timeStamp - s.t);
    const largo = window.innerWidth;
    const supera = Math.abs(d) > largo * 0.25 || (v > 0.5 && Math.abs(d) > 40);
    setRilascio(true);
    const vai = supera && d < 0 && o.puoAvanti ? o.onAvanti : supera && d > 0 && o.puoIndietro ? o.onIndietro : null;
    if (!vai) { setDx(0); return; }
    // La scheda esce dal lato dello swipe (180 ms), poi entra il club vicino.
    setDx(d < 0 ? -largo : largo);
    setTimeout(() => { setRilascio(false); setDx(0); vai(); }, 180);
  };

  return {
    stile: {
      transform: dx ? `translateX(${dx}px)` : undefined,
      transition: rilascio ? 'transform var(--t-swipe) ease-out' : 'none',
    },
    gestori: {
      onPointerDown(e: React.PointerEvent) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.clientX < BORDO || e.clientX > window.innerWidth - BORDO) return;
        g.current = { x: e.clientX, y: e.clientY, t: e.timeStamp, dir: null, id: e.pointerId };
        trascinato.current = false;
      },
      onPointerMove(e: React.PointerEvent) {
        const s = g.current;
        if (!s || s.id !== e.pointerId) return;
        const ddx = e.clientX - s.x, ddy = e.clientY - s.y;
        if (!s.dir) {
          if (Math.abs(ddx) < 10 && Math.abs(ddy) < 10) return;
          s.dir = Math.abs(ddx) > Math.abs(ddy) ? 'h' : 'v';
          if (s.dir === 'h') {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            trascinato.current = true;
          }
        }
        if (s.dir !== 'h') return;
        // Resistenza se non c'è un club da quella parte.
        const bloccato = (ddx < 0 && !o.puoAvanti) || (ddx > 0 && !o.puoIndietro);
        setRilascio(false);
        setDx(bloccato ? ddx / 4 : ddx);
      },
      onPointerUp: fine,
      onPointerCancel: fine,
      onClickCapture(e: React.MouseEvent) {
        // Dopo un trascinamento il tocco non deve aprire nulla.
        if (trascinato.current) { e.preventDefault(); e.stopPropagation(); trascinato.current = false; }
      },
    },
  };
}
