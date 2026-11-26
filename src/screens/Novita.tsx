import { useEffect, useMemo, useState } from 'react';
import { sogliaNonVisti } from '../components/BarraBasso';
import { TastiContatto } from '../components/TastiContatto';
import { Stemma } from '../components/Stemma';
import type { CambioDettaglio } from '../data/DataService';
import { useDati } from '../data/dati';
import { etichettaRuolo, nomeCompleto } from '../domain/types';
import { clubDistinti, useApriClub } from '../lib/apriClub';
import { tempoFa } from '../lib/date';
import { usePosizione } from '../lib/navigazione';
import { memoria } from '../store/archivio';
import { novitaVista, numeri } from '../store/procuratore';

const TIPO = { 'nuovo-arrivo': 'Nuovo arrivo', cambio: 'Cambio', 'ruolo-vacante': 'Ruolo vacante' } as const;

/** Testo del Cambio, es. "Novara – nuovo Direttore sportivo: Mario Rossi, prima Luca Bianchi". */
export function testoCambio({ cambio, club, persona, precedente }: CambioDettaglio): string {
  const ruolo = etichettaRuolo(cambio);
  const nuovo = ruolo.startsWith('Segreteria') ? 'nuova' : 'nuovo';
  if (cambio.tipo === 'ruolo-vacante') {
    return `${club.nome} – ${ruolo} vacante${precedente ? `: ${nomeCompleto(precedente)} ha lasciato` : ''}`;
  }
  const chi = persona ? nomeCompleto(persona) : '—';
  const prima = cambio.tipo === 'cambio' && cambio.provenienza
    ? ` (prima ${cambio.provenienza})`
    : precedente ? `, prima ${nomeCompleto(precedente)}` : '';
  return `${club.nome} – ${nuovo} ${ruolo}: ${chi}${prima}`;
}

/** Soglia dei Cambi da evidenziare: fissata all'ingresso nella sezione, vale finché non se ne esce. */
const CHIAVE_SOGLIA = 'soglia-novita';
export function esciDaNovita() {
  memoria.delete(CHIAVE_SOGLIA);
}

export function Novita() {
  const novita = useDati('novita', (s) => s.novita());
  const indice = useDati('persone-in-ruolo', (s) => s.personeInRuolo());
  const n = numeri.use();
  const apriClub = useApriClub('novita');

  const [soglia] = useState<string>(() => {
    const s = memoria.get(CHIAVE_SOGLIA) as string | undefined;
    if (s) return s;
    const nuova = sogliaNonVisti(novitaVista.get());
    memoria.set(CHIAVE_SOGLIA, nuova);
    return nuova;
  });
  // Aprendo la sezione il pallino si azzera.
  useEffect(() => { novitaVista.set(new Date().toISOString()); }, []);

  usePosizione('novita', !!novita);
  const sequenza = useMemo(() => clubDistinti((novita ?? []).map((x) => x.club.id)), [novita]);

  return (
    <main className="schermata">
      <header className="testata"><h1 className="titolo">Novità</h1></header>
      {novita && (
        <div className="blocco">
          {novita.map((x) => {
            const { cambio, club, persona } = x;
            const nonVisto = cambio.data > soglia;
            const numero = persona ? n.personali[persona.id] : undefined;
            const voce = persona && indice?.find((v) => v.persona.id === persona.id && v.club.id === club.id);
            return (
              <div key={cambio.id} className="novita-riga">
                <button className="corpo" onClick={() => apriClub(club.id, sequenza, 'Novità',
                  voce ? voce.incarico : { id: '', area: cambio.area })}>
                  <span className={`tipo etichetta${cambio.tipo === 'ruolo-vacante' ? ' vacante' : ''}`}>
                    {nonVisto && <span className="puntino" aria-label="Non visto" />}
                    {TIPO[cambio.tipo]}
                  </span>
                  <span className="testo">{testoCambio(x)}</span>
                  <span className="meta">{tempoFa(cambio.data)}</span>
                </button>
                {numero && persona ? (
                  <div className="azioni" style={{ display: 'flex' }}>
                    <TastiContatto numero={numero} chi={nomeCompleto(persona)} soloChiama
                      soggetto={{ personaId: persona.id, incaricoId: voce ? voce.incarico.id : undefined }} />
                  </div>
                ) : (
                  <Stemma club={club} size={32} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
