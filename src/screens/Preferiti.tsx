import { useMemo } from 'react';
import { IconaStella } from '../components/Icone';
import { RigaPersona } from '../components/RigaPersona';
import { StatoVuoto } from '../components/StatoVuoto';
import { useDati } from '../data/dati';
import { clubDistinti, useApriClub } from '../lib/apriClub';
import { usePosizione } from '../lib/navigazione';
import { preferiti } from '../store/procuratore';
import { CardClub } from './Squadre';

const ETICHETTA = 'Preferiti';

/** Preferiti: Persone in alto, Club sotto. */
export function Preferiti() {
  const pref = preferiti.use();
  const clubs = useDati('club', (s) => s.elencoClub());
  const indice = useDati('persone-in-ruolo', (s) => s.personeInRuolo());
  const apriClub = useApriClub('preferiti');

  const persone = useMemo(
    () => pref.persone.flatMap((id) => {
      const v = indice?.find((x) => x.persona.id === id);
      return v ? [v] : [];
    }),
    [pref.persone, indice],
  );
  const club = useMemo(
    () => pref.club.flatMap((id) => clubs?.find((c) => c.id === id) ?? []),
    [pref.club, clubs],
  );
  usePosizione('preferiti', !!clubs && !!indice);

  const seqPersone = clubDistinti(persone.map((v) => v.club.id));
  const seqClub = club.map((c) => c.id);

  return (
    <main className="schermata">
      <header className="testata"><h1 className="titolo">Preferiti</h1></header>
      {clubs && indice && persone.length + club.length === 0 && (
        <StatoVuoto icona={<IconaStella size={40} />} testo="Tocca la stellina accanto a una persona o a un club per ritrovarli qui." />
      )}
      {persone.length > 0 && (
        <section>
          <h2 className="etichetta sezione">Persone</h2>
          <div className="blocco">
            {persone.map((v) => (
              <RigaPersona key={v.persona.id} incarico={v.incarico} persona={v.persona} club={v.club} conClub
                onApri={() => apriClub(v.club.id, seqPersone, ETICHETTA, v.incarico)} />
            ))}
          </div>
        </section>
      )}
      {club.length > 0 && (
        <section>
          <h2 className="etichetta sezione">Club</h2>
          <ul className="lista">
            {club.map((c) => (
              <li key={c.id}><CardClub club={c} onApri={() => apriClub(c.id, seqClub, ETICHETTA)} /></li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
