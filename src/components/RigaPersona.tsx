import { etichettaRuolo, nomeCompleto, type Club, type Incarico, type Persona } from '../domain/types';
import { recente } from '../lib/date';
import { usePannello } from '../lib/navigazione';
import { alternaPreferito, numeri, numeroPer, preferiti } from '../store/procuratore';
import { IconaAltro, IconaPiu, IconaStella } from './Icone';
import { TastiContatto } from './TastiContatto';
import { useToast } from './Toast';

/**
 * Riga persona: Ruolo sopra, nome sotto (è il testo più importante).
 * Con un Numero aggiunto: Chiama + WhatsApp + ⋯. Senza: "+ Aggiungi numero" + ⋯.
 */
export function RigaPersona({ incarico, persona, club, conClub = false, onApri, evidenziata = false }: {
  incarico: Incarico;
  persona?: Persona;
  club: Club;
  /** Fuori dalla scheda club si mostra anche il club: "Direttore sportivo · Inter". */
  conClub?: boolean;
  /** Se presente, toccando nome e ruolo si apre la scheda del club. */
  onApri?: () => void;
  evidenziata?: boolean;
}) {
  const n = numeri.use();
  const pref = preferiti.use();
  const { apri } = usePannello();
  const toast = useToast();
  const ruolo = etichettaRuolo(incarico) + (conClub ? ` · ${club.nome}` : '');

  if (!persona) {
    return (
      <div className="riga" id={`incarico-${incarico.id}`}>
        <div className="corpo">
          <div className="ruolo">{ruolo}</div>
          <div className="vacante">Ruolo vacante</div>
        </div>
      </div>
    );
  }

  const numero = numeroPer(n, incarico);
  const nome = nomeCompleto(persona);
  const preferito = pref.persone.includes(persona.id);

  const apribile = onApri
    ? { role: 'link', tabIndex: 0, onClick: onApri, onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') onApri(); }, style: { cursor: 'pointer' } }
    : {};

  return (
    <div className={`riga${evidenziata ? ' evidenziata' : ''}`} id={`incarico-${incarico.id}`}>
      <div className="corpo" {...apribile}>
        <div className="ruolo">{ruolo}</div>
        <div className="nome">
          {nome}
          {recente(incarico.dal) && <span className="tag-nuovo">NUOVO</span>}
          <button className="stella stella-inline" aria-pressed={preferito}
            aria-label={preferito ? `Togli ${nome} dai Preferiti` : `Aggiungi ${nome} ai Preferiti`}
            onClick={(e) => {
              e.stopPropagation();
              const aggiunto = alternaPreferito('persone', persona.id);
              if (!aggiunto) toast.conAnnulla('Tolto dai Preferiti', () => alternaPreferito('persone', persona.id));
            }}>
            <IconaStella size={18} piena={preferito} />
          </button>
        </div>
      </div>
      <div className="azioni">
        {numero ? (
          <TastiContatto numero={numero.numero} chi={nome}
            soggetto={{ personaId: persona.id, incaricoId: incarico.id }} />
        ) : (
          <button className="tasto-contorno tocco" aria-label={`Aggiungi numero di ${nome}`}
            onClick={() => apri({ tipo: 'numero', incaricoId: incarico.id })}>
            <IconaPiu size={16} /> <span className="lungo">Aggiungi numero</span><span className="breve">Numero</span>
          </button>
        )}
        <button className="tasto-altro" aria-label={`Altre azioni per ${nome}`}
          onClick={() => apri({ tipo: 'menu', incaricoId: incarico.id })}>
          <IconaAltro size={22} />
        </button>
      </div>
    </div>
  );
}
