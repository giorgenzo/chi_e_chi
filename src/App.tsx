import { useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BarraBasso } from './components/BarraBasso';
import { PannelliHost } from './components/Pannelli';
import { ToastProvider } from './components/Toast';
import { sezioneDa, type StatoNav } from './lib/navigazione';
import { useTastiera } from './lib/tastiera';
import { esciDaNovita, Novita } from './screens/Novita';
import { Preferiti } from './screens/Preferiti';
import { Recenti } from './screens/Recenti';
import { SchedaClub } from './screens/SchedaClub';
import { Squadre } from './screens/Squadre';

export function App() {
  const location = useLocation();
  const sezione = sezioneDa(location.pathname, (location.state as StatoNav | null) ?? {});
  const { aperta } = useTastiera();

  // Uscendo dalla sezione Novità, i Cambi smettono di essere evidenziati.
  const precedente = useRef(sezione);
  useEffect(() => {
    if (precedente.current === 'novita' && sezione !== 'novita') esciDaNovita();
    precedente.current = sezione;
  }, [sezione]);

  return (
    <ToastProvider>
      <div className="copri-notch fisso" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<Navigate to="/squadre" replace />} />
        <Route path="/squadre" element={<Squadre />} />
        <Route path="/club/:id" element={<SchedaClub />} />
        <Route path="/novita" element={<Novita />} />
        <Route path="/preferiti" element={<Preferiti />} />
        <Route path="/recenti" element={<Recenti />} />
        <Route path="*" element={<Navigate to="/squadre" replace />} />
      </Routes>
      <BarraBasso nascosta={aperta} />
      <PannelliHost />
    </ToastProvider>
  );
}
