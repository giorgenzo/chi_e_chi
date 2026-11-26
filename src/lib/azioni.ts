import { useRef } from 'react';

/** Copia un testo negli appunti (con ripiego per le pagine non https). */
export async function copia(testo: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(testo);
    return true;
  } catch {
    try {
      const t = document.createElement('textarea');
      t.value = testo;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      const ok = document.execCommand('copy');
      t.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Pressione lunga (500 ms). Restituisce i gestori da mettere sull'elemento;
 * se la pressione è stata lunga, il clic che segue viene ignorato.
 */
export function usePressioneLunga(suLunga: () => void) {
  const timer = useRef<number | undefined>(undefined);
  const lunga = useRef(false);
  const inizio = useRef<{ x: number; y: number } | null>(null);
  const annulla = () => {
    window.clearTimeout(timer.current);
    inizio.current = null;
  };
  return {
    onPointerDown(e: React.PointerEvent) {
      lunga.current = false;
      inizio.current = { x: e.clientX, y: e.clientY };
      timer.current = window.setTimeout(() => {
        lunga.current = true;
        navigator.vibrate?.(15);
        suLunga();
      }, 500);
    },
    onPointerMove(e: React.PointerEvent) {
      const i = inizio.current;
      if (i && Math.hypot(e.clientX - i.x, e.clientY - i.y) > 10) annulla();
    },
    onPointerUp: annulla,
    onPointerCancel: annulla,
    onPointerLeave: annulla,
    onContextMenu(e: React.MouseEvent) { e.preventDefault(); },
    onClick(e: React.MouseEvent) {
      if (lunga.current) {
        e.preventDefault();
        lunga.current = false;
      }
    },
  };
}

export interface DatiContatto {
  nome: string;
  cognome: string;
  ruolo: string;
  club: string;
  telefono?: string;
  email?: string;
}

function esc(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function creaVCard(c: DatiContatto): string {
  const righe = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(c.cognome)};${esc(c.nome)};;;`,
    `FN:${esc(`${c.nome} ${c.cognome}`)}`,
    `ORG:${esc(c.club)}`,
    `TITLE:${esc(c.ruolo)}`,
  ];
  if (c.telefono) righe.push(`TEL;TYPE=CELL:${c.telefono.replace(/\s/g, '')}`);
  if (c.email) righe.push(`EMAIL:${c.email}`);
  righe.push('END:VCARD');
  return righe.join('\r\n');
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * "Salva nei contatti" tramite file .vcf (2-3 tocchi):
 * su iPhone Safari mostra la scheda contatto con "Crea nuovo contatto";
 * su Android il file si scarica e, aprendolo, la Rubrica propone l'importazione.
 */
export function salvaNeiContatti(c: DatiContatto) {
  const nomeFile = `${c.nome} ${c.cognome}.vcf`;
  const blob = new Blob([creaVCard(c)], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  if (isIOS()) {
    window.location.href = url;
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeFile;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
