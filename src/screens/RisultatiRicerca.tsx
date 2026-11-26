import { useMemo } from 'react';
import { IconaChiudi, IconaOrologio } from '../components/Icone';
import { RigaPersona } from '../components/RigaPersona';
import { TastiContatto } from '../components/TastiContatto';
import { useDati } from '../data/dati';
import { etichettaRuolo, nomeCompleto } from '../domain/types';
import { clubDistinti, useApriClub } from '../lib/apriClub';
import { cerca } from '../lib/cerca';
import { usePosizione } from '../lib/navigazione';
import { numeri, ricerche } from '../store/procuratore';
import { CardClub } from './Squadre';

const ETICHETTA = 'Risultati';

export function RisultatiRicerca({ testo, spazioSotto, onScegliRicerca, onApri }: {
  testo: string;
  /** Spazio libero in fondo (campo di ricerca e, se aperta, tastiera). */
  spazioSotto: number;
  onScegliRicerca: (q: string) => void;
  /** Chiamata prima di aprire un risultato: salva la ricerca e chiude la tastiera. */
  onApri: () => void;
}) {
  const clubs = useDati('club', (s) => s.elencoClub());
  const indice = useDati('persone-in-ruolo', (s) => s.personeInRuolo());
  const n = numeri.use();
  const ultime = ricerche.use();
  const apriClub = useApriClub('squadre');

  const r = useMemo(() => cerca(testo, clubs ?? [], indice ?? [], n), [testo, clubs, indice, n]);
  usePosizione('ricerca', !!clubs && !!indice);

  const stile = { paddingBottom: spazioSotto + 16 };

  if (!testo.trim()) {
    return (
      <main className="schermata risultati" style={stile}>
        <h1 className="sr-only">Ricerca</h1>
        {ultime.length > 0 && (
          <section className="gruppo-risultati">
            <h2 className="etichetta sezione">Ricerche recenti</h2>
            <ul className="blocco lista ultime-ricerche" style={{ gap: 0 }}>
              {ultime.map((q) => (
                <li key={q}>
                  <button className="testo" onClick={() => onScegliRicerca(q)}>
                    <IconaOrologio size={18} style={{ color: 'var(--text-3)' }} /> {q}
                  </button>
                  <button className="tasto-icona" aria-label={`Togli "${q}" dalle ricerche recenti`}
                    onClick={() => ricerche.set((l) => l.filter((x) => x !== q))}>
                    <IconaChiudi size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    );
  }

  const nessuno = r.club.length + r.persone.length + r.numeri.length === 0;
  const seqPersone = clubDistinti(r.persone.map((v) => v.club.id));
  const seqNumeri = clubDistinti(r.numeri.map((x) => x.club.id));

  return (
    <main className="schermata risultati" style={stile}>
      <h1 className="sr-only">Risultati per {testo}</h1>
      {nessuno && (
        <p className="nessun-risultato">Nessun risultato per “{testo}” — prova con il cognome o con il club</p>
      )}

      {r.club.length > 0 && (
        <section className="gruppo-risultati">
          <h2 className="etichetta sezione">Club</h2>
          <ul className="lista">
            {r.club.map((c) => (
              <li key={c.id}>
                <CardClub club={c} onApri={() => { onApri(); apriClub(c.id, r.club.map((x) => x.id), ETICHETTA); }} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.persone.length > 0 && (
        <section className="gruppo-risultati">
          <h2 className="etichetta sezione">Persone</h2>
          <div className="blocco">
            {r.persone.map((v) => (
              <RigaPersona key={v.incarico.id} incarico={v.incarico} persona={v.persona} club={v.club} conClub
                onApri={() => { onApri(); apriClub(v.club.id, seqPersone, ETICHETTA, v.incarico); }} />
            ))}
          </div>
        </section>
      )}

      {r.numeri.length > 0 && (
        <section className="gruppo-risultati">
          <h2 className="etichetta sezione">Numeri</h2>
          <div className="blocco">
            {r.numeri.map((x) => {
              const chi = x.voce ? nomeCompleto(x.voce.persona) : `Segreteria settore giovanile ${x.club.nome}`;
              const dettaglio = x.voce
                ? `${etichettaRuolo(x.voce.incarico)} · ${x.club.nome}${x.tipo === 'ruolo' ? ' · numero di ruolo' : ''}`
                : `Segreteria settore giovanile · ${x.club.nome}`;
              return (
                <div className="riga" key={`${x.tipo}-${x.numero}-${x.club.id}`}>
                  <div className="corpo" role="link" tabIndex={0} style={{ cursor: 'pointer' }}
                    onClick={() => {
                      onApri();
                      apriClub(x.club.id, seqNumeri, ETICHETTA, x.voce?.incarico ?? { id: `recapito-${x.club.id}`, area: 'settore-giovanile' });
                    }}>
                    <div className="nome numero">{x.numero}</div>
                    <div className="dettaglio">{x.voce ? `${chi} · ${dettaglio}` : dettaglio}</div>
                  </div>
                  <div className="azioni">
                    <TastiContatto numero={x.numero} chi={chi}
                      soggetto={x.voce ? { personaId: x.voce.persona.id, incaricoId: x.voce.incarico.id } : { clubId: x.club.id }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
