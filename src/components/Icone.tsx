import type { SVGProps } from 'react';

/** Icone SVG con lo stesso spessore di linea. Decorative: il testo accessibile sta sul tasto. */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const IconaSquadre = ({ piena, ...p }: P & { piena?: boolean }) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6L12 3Z" fill={piena ? 'currentColor' : 'none'} />
  </Svg>
);

export const IconaNovita = ({ piena, ...p }: P & { piena?: boolean }) => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" fill={piena ? 'currentColor' : 'none'} />
    <path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </Svg>
);

export const IconaStella = ({ piena, ...p }: P & { piena?: boolean }) => (
  <Svg {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" fill={piena ? 'currentColor' : 'none'} />
  </Svg>
);

export const IconaRecenti = ({ piena, ...p }: P & { piena?: boolean }) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" fill={piena ? 'currentColor' : 'none'} />
    <path d="M12 7.5V12l3 2" stroke={piena ? 'var(--surface-1)' : 'currentColor'} />
  </Svg>
);

export const IconaTelefono = (p: P) => (
  <Svg {...p}>
    <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
  </Svg>
);

/** Fumetto di chat con cornetta: richiama WhatsApp senza usarne il marchio. */
export const IconaWhatsApp = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.2 18.5l-3.7 1Z" />
    <path d="M9.2 8.8c.2 2.8 3 5.5 5.9 5.9l1-1.3-1.8-.9-.8.6a4.8 4.8 0 0 1-2.6-2.6l.6-.8-.9-1.8-1.4.9Z" strokeWidth={1.4} />
  </Svg>
);

export const IconaAltro = (p: P) => (
  <Svg {...p}>
    <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconaIndietro = (p: P) => (<Svg {...p}><path d="M15 5 8 12l7 7" /></Svg>);
export const IconaAvanti = (p: P) => (<Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>);
export const IconaCerca = (p: P) => (<Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></Svg>);
export const IconaChiudi = (p: P) => (<Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>);
export const IconaPiu = (p: P) => (<Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>);
export const IconaOrologio = (p: P) => (<Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>);

export const IconaAggiorna = (p: P) => (
  <Svg {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M19.5 4.5v4h-4" />
  </Svg>
);

export const IconaEmail = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
);

export const IconaContatto = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="3.5" />
    <path d="M5 19.5c1.2-3 3.8-4.5 7-4.5s5.8 1.5 7 4.5" />
  </Svg>
);

export const IconaModifica = (p: P) => (
  <Svg {...p}>
    <path d="M14.5 5.5 18.5 9.5M4.5 19.5l1-4.5 10-10 3.5 3.5-10 10-4.5 1Z" />
  </Svg>
);

export const IconaCestino = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5" />
  </Svg>
);
