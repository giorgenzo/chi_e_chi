import { leggi, scrivi } from '../store/archivio';
import { numeri, recenti, type Canale, type NumeriAggiunti, type Recente } from '../store/procuratore';
import { giorniFa } from './DemoDataService';
import rubrica from './demo-rubrica.json';

interface RubricaDemo {
  numeri: { tipo: 'personale' | 'ruolo'; personaId?: string; incaricoId?: string; numero: string }[];
  recenti: { canale: Canale; personaId: string; numero: string; giorniFa: number }[];
}

/**
 * Solo per la demo: al primo avvio alcune Persone hanno già un Numero aggiunto
 * e ci sono un paio di Recenti, per mostrare subito Chiama, WhatsApp e Recenti.
 * Non tocca nulla se il Procuratore ha già usato l'app.
 */
export function preparaRubricaDemo() {
  if (leggi('demo-preparata')) return;
  const r = rubrica as RubricaDemo;
  const n: NumeriAggiunti = { personali: {}, diRuolo: {} };
  for (const x of r.numeri) {
    if (x.tipo === 'personale' && x.personaId) n.personali[x.personaId] = x.numero;
    if (x.tipo === 'ruolo' && x.incaricoId) n.diRuolo[x.incaricoId] = x.numero;
  }
  numeri.set(n);
  recenti.set(
    r.recenti.map<Recente>((x, i) => ({
      id: `demo${i}`, canale: x.canale, personaId: x.personaId, numero: x.numero, quando: giorniFa(x.giorniFa),
    })),
  );
  scrivi('demo-preparata', true);
}
