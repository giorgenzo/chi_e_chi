# DESIGN.md — Chi è Chi (demo)

> Formato ispirato a awesome-design-md; regole prese da ui-ux-pro-max (profilo "CRM & gestione contatti" + "Squadra/club sportivo", checklist mobile "pro").
> Nome del progetto: **Chi è Chi**. L'app non mostra il nome a schermo: si riconosce dal logo.

## Overview

Strumento di lavoro per un procuratore sportivo, usato con una mano, spesso in movimento o all'aperto.
Tre parole guida: **veloce, leggibile, sobrio**.
Stile: **scuro minimal sportivo**, cioè tema scuro OLED con impostazione piatta (Flat / Swiss). Niente decorazioni: lo spazio visivo va ai **nomi delle persone**, l'unico colore acceso va alle **azioni** (Chiama) e ai **cambi** (Nuovo).

Regola dei 3 tocchi: dall'apertura alla chiamata non servono più di 3 tocchi.

## Colors

### Superfici
| Token | Valore | Uso |
|---|---|---|
| `bg` | `#000000` | Sfondo app (nero OLED) |
| `surface-1` | `#121212` | Card club, righe persona, barra in basso |
| `surface-2` | `#1C1C1E` | Campo di ricerca, menu ⋯, pannelli dal basso |
| `border` | `#2A2A2C` | Divisori sottili (1px) |

### Testo
| Token | Valore | Uso |
|---|---|---|
| `text-1` | `#F5F5F5` | Nomi, titoli |
| `text-2` | `#A1A1A6` | Ruoli, città, date (contrasto ≥ 4,5:1 su `surface-1`) |
| `text-3` | `#8E8E93` | Testo segnaposto (es. nel campo di ricerca), contrasto ≥ 4,5:1 anche su `surface-2` |

### Accento e semantici
| Token | Valore | Uso |
|---|---|---|
| `accent` | `#22C55E` (verde campo) | **Unico accento**: tasto Chiama, etichetta Nuovo, pallino Novità, stellina attiva |
| `on-accent` | `#03140A` | Testo e icone sopra l'accento |
| `accent-soft` | `rgba(34,197,94,0.14)` | Sfondo dell'etichetta Nuovo, stato premuto |
| `warning` | `#F5A524` | Solo per "Ruolo vacante" nelle Novità |

Colori dei club: usati **solo** nello stemma segnaposto (cerchio con iniziali). Mai loghi ufficiali.

## Typography

### Font Family
Font di sistema (`-apple-system, "SF Pro Text", Roboto, "Segoe UI", sans-serif`): zero download, apertura istantanea, aspetto nativo su iPhone e Android.

### Hierarchy
| Livello | Dimensione / peso | Uso |
|---|---|---|
| Titolo schermata | 22 / 700 | "Novità", "Preferiti", nome club nella scheda |
| Nome persona | 17 / 600 | Righe persona: è il testo più importante |
| Nome club (card) | 17 / 600 | Lista club |
| Corpo | 15 / 400 | Testi nelle Novità |
| Ruolo / meta | 13 / 500, `text-2` | Ruolo, città, "Aggiornato 2 giorni fa" |
| Etichetta | 11 / 700, maiuscolo, spaziatura +0,04em | NUOVO, sezioni (PRIMA SQUADRA) |

### Principles
- Le dimensioni seguono l'impostazione dei caratteri del telefono fino a circa +30%, poi restano stabili.
- Campi di input a **16px minimo**, altrimenti iPhone fa lo zoom automatico.
- Mai testo sotto i 11px; il testo normale non scende sotto i 13px.
- Numeri di telefono con cifre a larghezza fissa (`font-variant-numeric: tabular-nums`).

## Layout

### Spacing System
Scala a 4px: 4 · 8 · 12 · 16 · 24 · 32. Margine laterale schermate: 16px.

### Grid & Container
- Progettato per 390×844 (iPhone standard), funzionante da 360 a 430px.
- Da PC: colonna larga 430px centrata, sfondo esterno `bg`.
- Rispetto delle zone sicure (notch e barra dei gesti) per intestazioni, barra in basso e campo di ricerca: `env(safe-area-inset-*)`.
- Nessuno scorrimento orizzontale della pagina (lo swipe tra club è un gesto, non uno scroll).

### Whitespace Philosophy
Righe compatte ma toccabili: si vedono più nomi possibile senza rinunciare ai 44px di area toccabile.

## Elevation & Depth

Nessuna ombra. La profondità si dà solo con le superfici (`bg` → `surface-1` → `surface-2`).
I pannelli dal basso (menu ⋯, Aggiungi numero) hanno sotto uno sfondo scurito al 60%.

## Shapes

| Elemento | Raggio |
|---|---|
| Card club, pannelli | 14px |
| Campo di ricerca, tasti | 12px |
| Etichette, pallini | pieno (999px) |
| Stemma segnaposto | cerchio |

## Components

### Logo
Simbolo astratto originale (niente testo, niente elementi di club reali): monogramma geometrico in `accent` su `bg`. Usato in alto a sinistra nella Home e come icona dell'app sulla schermata Home del telefono.

### Barra in basso
4 voci con icona SVG e testo: **Squadre · Novità · Preferiti · Recenti**. Altezza 56px + zona sicura. Voce attiva in `text-1` con icona piena; le altre in `text-2`. Su Novità c'è un pallino `accent` con il numero di cambi non ancora visti.

### Campo di ricerca (barra unica)
Fisso in basso sopra la barra di navigazione (zona del pollice), sulla schermata Squadre. Icona lente + "Cerca club, persona o numero". Con lettere cerca club e persone, con cifre cerca tra i numeri. Risultati raggruppati: **Club · Persone · Numeri**.

### Selettore categoria
Controllo a segmenti in alto: **Serie A · Serie B · Serie C**. Con Serie C compare una seconda riga: **Girone A · B · C**. L'ultimo filtro usato viene ricordato.

### Card club (lista)
Riga su `surface-1`, altezza ~72px: stemma segnaposto 40px · nome club (17/600) + città (13, `text-2`) · anteprima "DS Nome Cognome" · stellina a destra. Un tocco apre la scheda.

### Scheda club
- Intestazione: frecce ‹ › per club precedente/successivo, stemma, nome club (22/700), categoria e girone, "Aggiornato 2 giorni fa" + icona **Aggiorna** (giro su sé stessa, poi messaggio "Dati aggiornati").
- Tab **Prima squadra | Settore giovanile**: si cambiano **solo toccando**. Lo swipe orizzontale cambia club, nella sequenza della lista di provenienza.
- Settore giovanile: in alto i responsabili del vivaio, poi un blocco per squadra (Primavera, U18, U17, U16, U15) con l'allenatore; in fondo il **Recapito del club** (segreteria SG: telefono ed email).

### Riga persona
- Ruolo (13/500, `text-2`) sopra, nome (17/600) sotto, etichetta **NUOVO** se arrivata negli ultimi 7 giorni, stellina accanto al nome.
- Con un Numero aggiunto: tasto **Chiama** (pieno, `accent`, 44×44) + tasto **WhatsApp** (contorno, icona) + **⋯**.
- Senza numero: tasto testuale **"+ Aggiungi numero"** (contorno) + **⋯**. Su righe strette (telefoni fino a ~400px) il tasto diventa **"+ Numero"**; con caratteri molto grandi i tasti scendono sotto il nome. Il nome non si taglia mai.
- Menu ⋯ (pannello dal basso): Modifica numero · Email (se c'è) · Salva nei contatti.

### Pannello "Aggiungi numero"
Campo numero (16px, tastiera numerica) + selettore **Personale (segue la persona)** già scelto / **Di ruolo (resta al club)** + tasto Salva. Sotto: "Visibile solo a te".

### Elemento Novità
Riga con: tipo (Nuovo arrivo · Cambio · Ruolo vacante), testo ("Novara – nuovo DS: Mario Rossi, prima Luca Bianchi"), tempo ("2 giorni fa"). Un tocco apre la scheda del club. Se la persona ha un Numero personale, c'è il tasto Chiama direttamente nella riga.

### Recenti
Elenco con persona, club, tipo (Chiamata / WhatsApp) e "Contattato 3 giorni fa"; tocco su Chiama per richiamare.

### Messaggi brevi (toast)
In basso sopra la barra, 2,5 secondi: "Dati aggiornati", "Numero salvato".

### Indicatore di posizione (scheda club)
Tra le frecce ‹ ›: "3 di 5 · Serie C Girone A" (13/500, `text-2`). Al primo utilizzo, accenno di scivolamento laterale di 24px andata e ritorno (400ms), una volta sola.

### Messaggio con Annulla
Come i messaggi brevi, ma dura 5 secondi e ha a destra "ANNULLA" in `accent` (11/700).

### Stato vuoto
Al centro: icona SVG 40px in `text-3`, una riga in `text-2` (15/400), tasto contorno "Vai alle squadre".

### Feedback al tocco
Ogni elemento toccabile reagisce subito: stato premuto con `accent-soft` o leggera riduzione (scala 0,97) in 100ms. Nessun effetto che dipenda dal passaggio del mouse.

## Motion

| Movimento | Durata | Curva |
|---|---|---|
| Scheda club che entra o esce (da destra) | 250ms | ease-out |
| Pannello dal basso | 200ms | ease-out |
| Swipe tra club | segue il dito; al rilascio 180ms | ease-out |
| Stato premuto | 100ms | lineare |
| Evidenza del club al ritorno in lista | 600ms (dissolvenza di `accent-soft`) | ease-in-out |

Con `prefers-reduced-motion`: solo dissolvenze brevi, niente scorrimenti.

## Do's and Don'ts

### Do
- Mettere il nome della persona al centro di ogni elemento.
- Un solo accento verde, per azioni e cambi.
- Aree toccabili ≥ 44×44px, almeno 8px tra due tasti.
- Icone SVG coerenti (stesso spessore), sempre con testo o etichetta accessibile.
- Contrasto ≥ 4,5:1 verificato sul tema scuro.
- Rispettare `prefers-reduced-motion`: animazioni ridotte al minimo.

### Don't
- Nessun nome dell'app a schermo, nessuno splash, nessuna introduzione.
- Nessun logo o elemento grafico ufficiale dei club.
- Nessuna emoji come icona.
- Niente ombre, sfumature o effetti vetro.
- Niente testo sotto 11px, niente testo grigio su grigio.
- Lo swipe non cambia mai le tab (cambia solo club).
