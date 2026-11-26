import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { PersonaInRuolo } from '../data/DataService';
import { useDati } from '../data/dati';
import { etichettaRuolo, nomeCompleto } from '../domain/types';
import { salvaNeiContatti } from '../lib/azioni';
import { usePannello, type Pannello } from '../lib/navigazione';
import { normalizzaNumero } from '../lib/telefono';
import { cancellaNumero, numeri, numeroPer, salvaNumero, type TipoNumero } from '../store/procuratore';
import { IconaCestino, IconaContatto, IconaEmail, IconaModifica, IconaPiu } from './Icone';
import { useToast } from './Toast';

/** Pannello dal basso con sfondo scurito. Si chiude toccando fuori o con Indietro. */
function Foglio({ titolo, sottotitolo, onChiudi, children }: {
  titolo: string; sottotitolo?: string; onChiudi: () => void; children: ReactNode;
}) {
  return createPortal(
    <>
      <div className="velo" onClick={onChiudi} />
      <div className="pannello fisso" role="dialog" aria-modal="true" aria-label={titolo}>
        <div className="maniglia" />
        <h2>{titolo}</h2>
        {sottotitolo && <div className="meta sotto">{sottotitolo}</div>}
        {children}
      </div>
    </>,
    document.body,
  );
}

/** Mostra il pannello aperto (indicato nella cronologia), qualunque sia la schermata. */
export function PannelliHost() {
  const { aperto } = usePannello();
  if (!aperto) return null;
  return <PannelloAperto p={aperto} />;
}

function PannelloAperto({ p }: { p: Pannello }) {
  if (p.tipo === 'recapito') return <MenuRecapito clubId={p.clubId} />;
  return <PannelloPersona p={p} />;
}

function PannelloPersona({ p }: { p: Extract<Pannello, { incaricoId: string }> }) {
  const indice = useDati('persone-in-ruolo', (s) => s.personeInRuolo());
  const voce = indice?.find((x) => x.incarico.id === p.incaricoId);
  const { chiudi } = usePannello();
  // Il Ruolo non è più ricoperto da questa Persona (dati aggiornati): si chiude.
  useEffect(() => { if (indice && !voce) chiudi(); }, [indice, voce, chiudi]);
  if (!voce) return null;
  return p.tipo === 'menu' ? <MenuPersona voce={voce} /> : <AggiungiNumero voce={voce} />;
}

type Voce = PersonaInRuolo;

function MenuPersona({ voce }: { voce: Voce }) {
  const { persona, incarico, club } = voce;
  const { apri, chiudi } = usePannello();
  const n = numeri.use();
  const toast = useToast();
  const numero = numeroPer(n, incarico);
  const nome = nomeCompleto(persona);

  return (
    <Foglio titolo={nome} sottotitolo={`${etichettaRuolo(incarico)} · ${club.nome}${numero ? ` · ${numero.numero}` : ''}`} onChiudi={chiudi}>
      {numero ? (
        <button className="voce-menu" onClick={() => apri({ tipo: 'numero', incaricoId: incarico.id }, true)}>
          <IconaModifica /> Modifica numero
        </button>
      ) : (
        <button className="voce-menu" onClick={() => apri({ tipo: 'numero', incaricoId: incarico.id }, true)}>
          <IconaPiu /> Aggiungi numero
        </button>
      )}
      {persona.email && (
        <a className="voce-menu" href={`mailto:${persona.email}`} onClick={() => chiudi()}>
          <IconaEmail /> Email
        </a>
      )}
      <button className="voce-menu" onClick={() => {
        salvaNeiContatti({
          nome: persona.nome, cognome: persona.cognome, ruolo: etichettaRuolo(incarico), club: club.nome,
          telefono: numero?.numero, email: persona.email,
        });
        chiudi();
      }}>
        <IconaContatto /> Salva nei contatti
      </button>
      {numero && (
        <button className="voce-menu pericolo" onClick={() => {
          const prima = numero;
          cancellaNumero(prima.tipo, incarico);
          chiudi();
          toast.conAnnulla('Numero cancellato', () => salvaNumero(prima.tipo, incarico, prima.numero));
        }}>
          <IconaCestino /> Cancella numero
        </button>
      )}
    </Foglio>
  );
}

function AggiungiNumero({ voce }: { voce: Voce }) {
  const { persona, incarico, club } = voce;
  const { chiudi } = usePannello();
  const toast = useToast();
  const esistente = numeroPer(numeri.get(), incarico);
  const [testo, setTesto] = useState(esistente?.numero ?? '');
  const [tipo, setTipo] = useState<TipoNumero>(esistente?.tipo ?? 'personale');
  const [errore, setErrore] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // La tastiera si apre subito (dove il browser lo permette).
    const t = setTimeout(() => campo.current?.focus(), 220);
    return () => clearTimeout(t);
  }, []);

  const salva = () => {
    const numero = normalizzaNumero(testo);
    if (!numero) { setErrore(true); return; }
    salvaNumero(tipo, incarico, numero);
    chiudi();
    toast.mostra('Numero salvato');
  };

  return (
    <Foglio titolo={esistente ? 'Modifica numero' : 'Aggiungi numero'}
      sottotitolo={`${nomeCompleto(persona)} · ${etichettaRuolo(incarico)} · ${club.nome}`} onChiudi={chiudi}>
      <form onSubmit={(e) => { e.preventDefault(); salva(); }}>
        <label className="sr-only" htmlFor="numero">Numero di telefono</label>
        <input id="numero" ref={campo} className="campo" type="tel" inputMode="tel" autoComplete="off"
          placeholder="333 123 4567" value={testo}
          onChange={(e) => { setTesto(e.target.value); setErrore(false); }} />
        {errore && <div className="errore" role="alert">Numero non valido: controlla le cifre</div>}
        <div className="scelta-tipo" role="radiogroup" aria-label="Tipo di numero">
          <label>
            <input type="radio" name="tipo" checked={tipo === 'personale'} onChange={() => setTipo('personale')} />
            <span>Personale<small>Segue la persona se cambia club o ruolo</small></span>
          </label>
          <label>
            <input type="radio" name="tipo" checked={tipo === 'ruolo'} onChange={() => setTipo('ruolo')} />
            <span>Di ruolo<small>Resta al club per questo ruolo, anche se la persona se ne va</small></span>
          </label>
        </div>
        <button type="submit" className="tasto-pieno" disabled={!testo.trim()}>Salva</button>
        <div className="nota">Visibile solo a te</div>
      </form>
    </Foglio>
  );
}

function MenuRecapito({ clubId }: { clubId: string }) {
  const clubs = useDati('club', (s) => s.elencoClub());
  const club = clubs?.find((c) => c.id === clubId);
  const { chiudi } = usePannello();
  if (!club) return null;
  return (
    <Foglio titolo="Segreteria settore giovanile" sottotitolo={`${club.nome} · ${club.recapito.telefono}`} onChiudi={chiudi}>
      <a className="voce-menu" href={`mailto:${club.recapito.email}`} onClick={() => chiudi()}>
        <IconaEmail /> Email
      </a>
      <button className="voce-menu" onClick={() => {
        salvaNeiContatti({
          nome: 'Segreteria SG', cognome: club.nome, ruolo: 'Segreteria settore giovanile', club: club.nome,
          telefono: club.recapito.telefono, email: club.recapito.email,
        });
        chiudi();
      }}>
        <IconaContatto /> Salva nei contatti
      </button>
    </Foglio>
  );
}
