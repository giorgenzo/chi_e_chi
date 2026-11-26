import { useRef, useState, type ReactNode } from 'react';
import { IconaRecenti } from '../components/Icone';
import { StatoVuoto } from '../components/StatoVuoto';
import { TastiContatto } from '../components/TastiContatto';
import { useToast } from '../components/Toast';
import type { PersonaInRuolo } from '../data/DataService';
import { useDati } from '../data/dati';
import { etichettaRuolo, nomeCompleto, type Club } from '../domain/types';
import { useApriClub } from '../lib/apriClub';
import { tempoFa } from '../lib/date';
import { usePosizione } from '../lib/navigazione';
import { recenti, type Recente } from '../store/procuratore';

/** Recenti: tocchi su Chiama o WhatsApp fatti dall'app ("Contattato"). Solo sul telefono. */
export function Recenti() {
  const lista = recenti.use();
  const clubs = useDati('club', (s) => s.elencoClub());
  const indice = useDati('persone-in-ruolo', (s) => s.personeInRuolo());
  const toast = useToast();
  const apriClub = useApriClub('recenti');
  usePosizione('recenti', !!clubs && !!indice);

  const togli = (r: Recente) => {
    const prima = recenti.get();
    recenti.set((l) => l.filter((x) => x.id !== r.id));
    toast.conAnnulla('Recente tolto', () => recenti.set(prima));
  };

  return (
    <main className="schermata">
      <header className="testata">
        <h1 className="titolo">Recenti</h1>
        <div className="spazio" />
        {lista.length > 0 && (
          <button className="tasto-testo" onClick={() => {
            const prima = recenti.get();
            recenti.set([]);
            toast.conAnnulla('Recenti cancellati', () => recenti.set(prima));
          }}>Cancella tutto</button>
        )}
      </header>

      {lista.length === 0 && (
        <StatoVuoto icona={<IconaRecenti size={40} />} testo="Qui trovi le persone che chiami o scrivi su WhatsApp dall'app." />
      )}

      {lista.length > 0 && clubs && indice && (
        <div className="blocco">
          {lista.map((r) => {
            const d = descrivi(r, clubs, indice);
            if (!d) return null;
            const sequenza = [...new Set(lista.flatMap((x) => descrivi(x, clubs, indice)?.club.id ?? []))];
            return (
              <RigaScorrevole key={r.id} onTogli={() => togli(r)}>
                <div className="riga">
                  <div className="corpo" role="link" tabIndex={0} style={{ cursor: 'pointer' }}
                    onClick={() => apriClub(d.club.id, sequenza, 'Recenti',
                      d.voce?.incarico ?? (r.clubId ? { id: `recapito-${r.clubId}`, area: 'settore-giovanile' } : undefined))}>
                    <div className="nome">{d.nome}</div>
                    <div className="ruolo">{d.dettaglio}</div>
                    <div className="dettaglio">
                      {r.canale === 'chiamata' ? 'Chiamata' : 'WhatsApp'} · Contattato {tempoFa(r.quando)}
                    </div>
                  </div>
                  <div className="azioni">
                    <TastiContatto numero={r.numero} chi={d.nome} soloChiama
                      soggetto={{ personaId: r.personaId, incaricoId: r.incaricoId, clubId: r.clubId }} />
                  </div>
                </div>
              </RigaScorrevole>
            );
          })}
        </div>
      )}
    </main>
  );
}

function descrivi(r: Recente, clubs: Club[], indice: PersonaInRuolo[]) {
  if (r.clubId) {
    const club = clubs.find((c) => c.id === r.clubId);
    return club && { nome: `Segreteria ${club.nome}`, dettaglio: 'Recapito del club · settore giovanile', club, voce: undefined };
  }
  // La Persona oggi: se ha cambiato Club o Ruolo, si vede dove si trova adesso.
  const voce = indice.find((v) => v.incarico.id === r.incaricoId && v.persona.id === r.personaId)
    ?? indice.find((v) => v.persona.id === r.personaId);
  if (!voce) return null;
  return {
    nome: nomeCompleto(voce.persona),
    dettaglio: `${etichettaRuolo(voce.incarico)} · ${voce.club.nome}`,
    club: voce.club,
    voce,
  };
}

/** Riga che si toglie con uno swipe a sinistra. */
function RigaScorrevole({ onTogli, children }: { onTogli: () => void; children: ReactNode }) {
  const [dx, setDx] = useState(0);
  const [anima, setAnima] = useState(false);
  const g = useRef<{ x: number; y: number; dir: 'h' | 'v' | null } | null>(null);
  const trascinato = useRef(false);

  return (
    <div className="scorri-riga">
      <div className="sotto-swipe" aria-hidden="true">Togli</div>
      <div className="sopra"
        style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: anima ? 'transform 180ms ease-out' : 'none' }}
        onPointerDown={(e) => {
          if (e.clientX > window.innerWidth - 24) return;
          g.current = { x: e.clientX, y: e.clientY, dir: null };
          trascinato.current = false;
        }}
        onPointerMove={(e) => {
          const s = g.current;
          if (!s) return;
          const ddx = e.clientX - s.x, ddy = e.clientY - s.y;
          if (!s.dir) {
            if (Math.abs(ddx) < 10 && Math.abs(ddy) < 10) return;
            s.dir = Math.abs(ddx) > Math.abs(ddy) ? 'h' : 'v';
            if (s.dir === 'h') { e.currentTarget.setPointerCapture(e.pointerId); trascinato.current = true; }
          }
          if (s.dir !== 'h') return;
          setAnima(false);
          setDx(Math.min(0, ddx));
        }}
        onPointerUp={() => {
          const s = g.current;
          g.current = null;
          if (!s || s.dir !== 'h') return;
          setAnima(true);
          if (dx < -100) {
            setDx(-window.innerWidth);
            setTimeout(onTogli, 180);
          } else setDx(0);
        }}
        onPointerCancel={() => { g.current = null; setAnima(true); setDx(0); }}
        onClickCapture={(e) => {
          if (trascinato.current) { e.preventDefault(); e.stopPropagation(); trascinato.current = false; }
        }}>
        {children}
      </div>
    </div>
  );
}
