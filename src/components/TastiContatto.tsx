import { copia, usePressioneLunga } from '../lib/azioni';
import { linkChiamata, linkWhatsApp } from '../lib/telefono';
import { registraRecente, type Recente } from '../store/procuratore';
import { IconaTelefono, IconaWhatsApp } from './Icone';
import { useToast } from './Toast';

type Soggetto = Pick<Recente, 'personaId' | 'incaricoId' | 'clubId'>;

/**
 * Chiama (pieno, verde) e WhatsApp (contorno). Ogni tocco diventa un Recente.
 * Pressione lunga su Chiama: copia il numero.
 */
export function TastiContatto({ numero, soggetto, chi, soloChiama = false }: {
  numero: string;
  soggetto: Soggetto;
  /** Per le etichette accessibili: "Chiama Mario Rossi". */
  chi: string;
  soloChiama?: boolean;
}) {
  const toast = useToast();
  const lunga = usePressioneLunga(async () => {
    if (await copia(numero)) toast.mostra('Numero copiato');
  });
  return (
    <>
      <a className="tasto-chiama tocco" href={linkChiamata(numero)} aria-label={`Chiama ${chi}`}
        {...lunga}
        onClick={(e) => {
          lunga.onClick(e);
          if (!e.defaultPrevented) registraRecente({ ...soggetto, canale: 'chiamata', numero });
        }}>
        <IconaTelefono size={22} />
      </a>
      {!soloChiama && (
        <a className="tasto-contorno icona tocco" href={linkWhatsApp(numero)} target="_blank" rel="noopener noreferrer"
          aria-label={`WhatsApp a ${chi}`}
          onClick={() => registraRecente({ ...soggetto, canale: 'whatsapp', numero })}>
          <IconaWhatsApp size={22} />
        </a>
      )}
    </>
  );
}
