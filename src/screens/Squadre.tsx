import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EVENTO_ATTIVA_RICERCA } from '../components/BarraBasso';
import { IconaAggiorna, IconaCerca, IconaChiudi, IconaStella } from '../components/Icone';
import { Logo, Stemma } from '../components/Stemma';
import { useToast } from '../components/Toast';
import { invalidaDati, useDataService, useDati } from '../data/dati';
import { etichettaCategoria, nomeCompleto, type Categoria, type Club, type Girone } from '../domain/types';
import { usePosizione, type StatoNav } from '../lib/navigazione';
import { useTastiera } from '../lib/tastiera';
import { memoria } from '../store/archivio';
import { alternaPreferito, filtro, preferiti, ricordaRicerca } from '../store/procuratore';
import { RisultatiRicerca } from './RisultatiRicerca';

export function Squadre() {
  const [params, setParams] = useSearchParams();
  const inRicerca = params.get('cerca') === '1';
  const testo = params.get('q') ?? '';
  const navigate = useNavigate();
  const campo = useRef<HTMLInputElement>(null);
  const { aperta, altezza } = useTastiera();

  // 3° tocco su Squadre nella barra in basso: attiva la ricerca (nello stesso tocco, per aprire la tastiera).
  useEffect(() => {
    const f = () => attivaRicerca();
    window.addEventListener(EVENTO_ATTIVA_RICERCA, f);
    return () => window.removeEventListener(EVENTO_ATTIVA_RICERCA, f);
  });

  function attivaRicerca() {
    campo.current?.focus();
    if (!inRicerca) navigate('/squadre?cerca=1', { state: { sezione: 'squadre' } satisfies StatoNav });
  }

  const setTesto = (q: string) => {
    setParams((p) => { p.set('cerca', '1'); if (q) p.set('q', q); else p.delete('q'); return p; }, { replace: true, state: { sezione: 'squadre' } });
  };

  const fondo = aperta ? altezza : undefined;

  return (
    <>
      {inRicerca
        ? <RisultatiRicerca testo={testo} spazioSotto={(fondo ?? 0) + 72}
            onScegliRicerca={(q) => setTesto(q)}
            onApri={() => { ricordaRicerca(testo); campo.current?.blur(); }} />
        : <ListaClub />}

      <div className="ricerca-barra fisso"
        style={{ bottom: fondo !== undefined ? fondo : 'calc(var(--tabbar-h) + var(--safe-bottom))' }}>
        <form role="search" className="ricerca-campo"
          onSubmit={(e) => { e.preventDefault(); ricordaRicerca(testo); campo.current?.blur(); }}>
          <IconaCerca size={20} />
          <label className="sr-only" htmlFor="cerca">Cerca club, persona o numero</label>
          <input id="cerca" ref={campo} type="search" enterKeyHint="search" autoComplete="off" autoCorrect="off"
            spellCheck={false} placeholder="Cerca club, persona o numero" value={testo}
            onFocus={() => { if (!inRicerca) navigate('/squadre?cerca=1', { state: { sezione: 'squadre' } }); }}
            onChange={(e) => setTesto(e.target.value)} />
          {(testo || inRicerca) && (
            <button type="button" className="tasto-icona" aria-label={testo ? 'Cancella la ricerca' : 'Chiudi la ricerca'}
              onClick={() => {
                if (testo) { setTesto(''); campo.current?.focus(); }
                else { campo.current?.blur(); navigate(-1); }
              }}>
              <IconaChiudi size={20} />
            </button>
          )}
        </form>
      </div>
    </>
  );
}

function ListaClub() {
  const clubs = useDati('club', (s) => s.elencoClub());
  const indice = useDati('persone-in-ruolo', (s) => s.personeInRuolo());
  const f = filtro.use();
  const navigate = useNavigate();
  const service = useDataService();
  const toast = useToast();
  const [aggiornando, setAggiornando] = useState(false);

  const visibili = useMemo(
    () => (clubs ?? []).filter((c) => c.categoria === f.categoria && (f.categoria !== 'C' || c.girone === f.girone)),
    [clubs, f],
  );
  const ds = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of indice ?? []) if (v.incarico.ruolo === 'Direttore sportivo') m.set(v.club.id, nomeCompleto(v.persona));
    return m;
  }, [indice]);

  const chiave = `squadre:${f.categoria}${f.categoria === 'C' ? f.girone : ''}`;
  usePosizione(chiave, !!clubs);

  // Ritorno dalla scheda dopo aver sfogliato fino a un altro club: la lista si sposta lì e lo evidenzia.
  const [evidenzia, setEvidenzia] = useState<string | null>(null);
  const etichetta = etichettaCategoria({ categoria: f.categoria, girone: f.categoria === 'C' ? f.girone : undefined });
  useLayoutEffect(() => {
    const e = memoria.get('evidenzia-club') as { id: string; etichetta: string } | undefined;
    if (!clubs || !e) return;
    memoria.delete('evidenzia-club');
    if (e.etichetta !== etichetta) return;
    const id = e.id;
    const el = document.getElementById(`club-${id}`);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.top < 120 || r.bottom > window.innerHeight - 140) window.scrollBy(0, r.top - window.innerHeight / 2 + r.height / 2);
      setEvidenzia(id);
      setTimeout(() => setEvidenzia(null), 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubs]);

  const scegli = (categoria: Categoria, girone?: Girone) => {
    filtro.set((x) => ({ categoria, girone: girone ?? x.girone }));
  };

  return (
    <main className="schermata con-ricerca" style={{ paddingTop: 0 }}>
      <header className="testata" style={{ paddingTop: 'calc(var(--safe-top) + 8px)', minHeight: 'calc(var(--safe-top) + 60px)' }}>
        <Logo />
        <h1 className="sr-only">Squadre</h1>
        <div className="spazio" />
        <button className={`tasto-icona${aggiornando ? ' ruota' : ''}`} aria-label="Aggiorna tutti i club" disabled={aggiornando}
          onClick={async () => {
            setAggiornando(true);
            await service.aggiornaTutto();
            invalidaDati();
            setAggiornando(false);
            toast.mostra('Dati aggiornati');
          }}>
          <IconaAggiorna />
        </button>
      </header>

      <div className="selettore-wrap">
        <div className="segmenti" role="group" aria-label="Categoria">
          {(['A', 'B', 'C'] as Categoria[]).map((c) => (
            <button key={c} aria-pressed={f.categoria === c} onClick={() => scegli(c)}>Serie {c}</button>
          ))}
        </div>
        {f.categoria === 'C' && (
          <div className="segmenti piccoli" role="group" aria-label="Girone">
            {(['A', 'B', 'C'] as Girone[]).map((g) => (
              <button key={g} aria-pressed={f.girone === g} onClick={() => scegli('C', g)}>Girone {g}</button>
            ))}
          </div>
        )}
      </div>

      <ul className="lista" aria-label={etichetta} style={{ marginTop: 4 }}>
        {visibili.map((c) => (
          <li key={c.id}>
            <CardClub club={c} ds={ds.get(c.id)} evidenzia={evidenzia === c.id}
              onApri={() => navigate(`/club/${c.id}`, {
                state: { sezione: 'squadre', sequenza: visibili.map((x) => x.id), etichetta } satisfies StatoNav,
              })} />
          </li>
        ))}
      </ul>
    </main>
  );
}

export function CardClub({ club, ds, evidenzia = false, onApri }: {
  club: Club; ds?: string; evidenzia?: boolean; onApri: () => void;
}) {
  const pref = preferiti.use();
  const toast = useToast();
  const preferito = pref.club.includes(club.id);
  return (
    <div id={`club-${club.id}`} className={`card-club${evidenzia ? ' evidenzia' : ''}`}>
      <button className="corpo" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, textAlign: 'left' }} onClick={onApri}>
        <Stemma club={club} />
        <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span className="nome">{club.nome}</span>
          <span className="anteprima">{club.citta}{ds ? ` · DS ${ds}` : ''}</span>
        </span>
      </button>
      <button className="tasto-icona stella" aria-pressed={preferito}
        aria-label={preferito ? `Togli ${club.nome} dai Preferiti` : `Aggiungi ${club.nome} ai Preferiti`}
        onClick={() => {
          const aggiunto = alternaPreferito('club', club.id);
          if (!aggiunto) toast.conAnnulla('Tolto dai Preferiti', () => alternaPreferito('club', club.id));
        }}>
        <IconaStella size={22} piena={preferito} />
      </button>
    </div>
  );
}
