import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

/** Stato vuoto: icona sobria, una riga che spiega cosa fare, tasto "Vai alle squadre". */
export function StatoVuoto({ icona, testo }: { icona: ReactNode; testo: string }) {
  const navigate = useNavigate();
  return (
    <div className="vuoto">
      {icona}
      <p>{testo}</p>
      <button className="tasto-contorno tocco" style={{ padding: '0 16px' }} onClick={() => navigate('/squadre')}>
        Vai alle squadre
      </button>
    </div>
  );
}
