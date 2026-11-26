# Specifica della demo — Chi è Chi

Decisioni prese nelle sessioni di grilling del 24/11/2026 (funzioni + dettagli di interazione). Termini: vedi `CONTEXT.md` (radice). Stile: vedi `DESIGN.md` (radice). Decisione sui numeri: vedi `docs/adr/0001`.

## Obiettivo della demo
Far provare al procuratore, dal suo telefono, come funzionerebbe l'app: sapere **chi ricopre ogni ruolo** nei club di Serie A, B e C (con settori giovanili), **accorgersi dei cambi** e **contattare** chi ha già nel suo telefono, in pochi secondi.
Se la demo convince, si passa ai requisiti e allo sviluppo vero.

## Utente
Un solo procuratore. Non c'è login.

## Consegna
- Web app mobile, pubblicata su **GitHub Pages** e mandata come link su WhatsApp.
- Da PC si vede una colonna larga quanto un telefono, centrata.
- Installazione sulla schermata Home e funzionamento offline: **rimandati alla v1**.
- Nessun nome dell'app a schermo: solo un logo astratto.
- Nessuna pagina privacy e nessuna etichetta "DEMO" (scelta del committente).

## Dati
- **16 club** con **nomi reali**: 5 di Serie A, 5 di Serie B, 6 di Serie C (2 per girone), della stagione in corso. Elenco verificato sul web e confermato il 26/11/2026:
  - Serie A: Atalanta, Bologna, Inter, Monza, Napoli
  - Serie B: Cesena, Hellas Verona, Palermo, Sampdoria, Vicenza
  - Serie C: Novara, Trento (girone A) · Perugia, Spezia (girone B) · Bari, Catania (girone C)
- Squadre del settore giovanile: Primavera, U18, U17, U16, U15 per A e B; Primavera, U17, U16, U15 per la C (ipotesi non verificata: sono scritte nei dati di ogni club, si correggono lì).
- Stemmi segnaposto (cerchio con iniziali nei colori sociali), **mai loghi ufficiali**.
- **Persone tutte inventate.** Nessun numero di persona fornito dall'app.
- Unico recapito fornito: **segreteria del settore giovanile** (telefono ed email finti).
- All'avvio **3-4 persone hanno già un Numero aggiunto** (finto), per mostrare subito Chiama, WhatsApp e Recenti.
- Date di "Ultimo aggiornamento" tutte recenti; la demo appare sempre aggiornata.
- Dati in un file separato dall'interfaccia, per poterli sostituire facilmente.

## Schermate e navigazione
Barra in basso: **Squadre · Novità · Preferiti · Recenti**. Si apre su Squadre.

### Squadre
- Selettore Serie A / B / C (con Serie C: girone A / B / C). Ricorda l'ultimo filtro.
- Lista verticale di card compatte.
- **Barra di ricerca unica** in basso: club, persone e numeri (con 4-5 cifre). Risultati in tre gruppi: Club, Persone, Numeri.
- Icona **Aggiorna tutto** (simulata).

### Scheda club
- Swipe orizzontale o frecce ‹ › per il club successivo/precedente, **nella sequenza della lista di provenienza** (categoria, ricerca o Preferiti). "Indietro" riporta lì.
- Tab **Prima squadra | Settore giovanile**, cambiabili solo toccandole.
- Settore giovanile: responsabili in alto, poi un blocco per squadra (Primavera, U18, U17, U16, U15), poi il recapito della segreteria.
- "Aggiornato il…" con icona **Aggiorna questo club** (simulata).

### Riga persona
- Con un numero: **Chiama** + **WhatsApp** + menu ⋯ (Modifica numero, Email, Salva nei contatti `.vcf`).
- Senza numero: **+ Aggiungi numero** + ⋯.
- Aggiungi numero: tipo **Personale** (predefinito, segue la persona) o **Di ruolo** (resta al club). Salvato solo sul telefono.
- Stellina Preferito, etichetta **NUOVO** per 7 giorni.

### Novità
- Cambi recenti: nuovo arrivo, persona che cambia ruolo o club, ruolo vacante.
- Pallino con il numero di cambi non visti sulla voce della barra.
- Chiama direttamente dalla riga se la persona ha un Numero personale.

### Preferiti
Due sezioni: **Persone** in alto, **Club** sotto.

### Recenti
Tocchi su Chiama o WhatsApp fatti dall'app, etichetta "Contattato". Salvati solo sul telefono.

## Tecnologia (base per l'app vera)
- **React + TypeScript + Vite**, pubblicazione automatica su GitHub Pages a ogni push.
- Ogni schermata ha il suo indirizzo (link diretto, tasto Indietro che funziona). Su GitHub Pages si usano indirizzi con `#` (HashRouter, scelto il 26/11/2026): niente errori 404 ricaricando una pagina interna; con un server vero si passerà a indirizzi puliti cambiando una riga.
- Le schermate leggono i dati solo da un **servizio dati**: nella demo legge il file finto, nell'app vera chiamerà il backend (Spring Boot) senza toccare le schermate.
- Dati del procuratore (numeri aggiunti, Preferiti, Recenti, ricerche recenti) salvati solo sul telefono.

## Dettagli di interazione

### Navigazione e "indietro"
- Freccia ‹ dell'app, tasto Indietro di Android e swipe dal bordo su iPhone fanno **la stessa cosa, un passo alla volta**: prima chiudono il pannello aperto, poi tornano alla schermata precedente. Il tasto Indietro non fa mai uscire dall'app per sbaglio.
- Nella scheda club: lo swipe che **parte dal bordo** (primi ~24px) è "indietro"; lo swipe che **parte dal centro** cambia club.
- Tornando alla lista: **stessa posizione e stesso filtro**. Se nella scheda si è sfogliato fino a un altro club, la lista si sposta su quel club e lo evidenzia per un attimo.
- Toccare di nuovo la voce attiva della barra in basso: 1° tocco → schermata principale della sezione; 2° → inizio lista; 3° (solo Squadre) → attiva la ricerca.
- Scheda club: indicatore "3 di 5 · Serie C Girone A" (oppure "Risultati" o "Preferiti") tra le frecce ‹ ›. La prima volta la scheda accenna un piccolo scivolamento laterale per far capire lo swipe, poi mai più.
- Lista club: il selettore Serie A/B/C (e girone) **resta fisso** in alto; logo e spazio sopra spariscono scorrendo.

### Ricerca
- Tornando indietro da un risultato: **ricerca intatta** (testo e risultati), tastiera chiusa; ✕ per cancellare.
- Campo vuoto: **ultime 5 ricerche**, toccabili, ciascuna con ✕ per toglierla.
- Ignora accenti e maiuscole e **tollera un piccolo errore di battitura**. Se non trova nulla: "Nessun risultato per '…' — prova con il cognome o con il club".
- Con la tastiera aperta il campo **sale sopra la tastiera**, i risultati scorrono sopra e la barra in basso si nasconde. Va provato su iPhone e Android veri.

### Azioni e protezione dagli errori
- Togliere un preferito, cancellare un numero o un Recente: l'azione avviene **subito**, con un messaggio "… · ANNULLA" per 5 secondi. Nessun popup di conferma.
- **Pressione lunga** su un numero: lo copia e mostra "Numero copiato".
- Numeri aggiunti: qualsiasi formato in ingresso, **salvati e mostrati come +39 333 123 4567** (serve a WhatsApp e alla ricerca per cifre).
- Recenti: **swipe a sinistra** su una riga per toglierla, **"Cancella tutto"** in alto (entrambi con Annulla).

### Stati e contenuti
- **Stati vuoti** (Preferiti, Recenti): icona sobria, una riga che spiega cosa fare, tasto "Vai alle squadre".
- **Novità**: aprendo la sezione il pallino si azzera; i cambi non visti restano evidenziati con un puntino verde fino all'uscita dalla sezione.
- **Nomi lunghi**: il nome va a capo (massimo 2 righe, mai tagliato); il ruolo sta su 1 riga con i puntini; i tasti a destra hanno sempre la loro misura.

### Movimento e accessibilità
- Animazioni **sobrie e rapide** (150-250ms): la scheda entra da destra, i pannelli salgono dal basso, lo swipe segue il dito. Ridotte al minimo se il telefono chiede meno movimento.
- Il testo segue la **dimensione dei caratteri del telefono** fino a circa +30%.

## Fuori dalla demo (idee per dopo)
- Segnalazione di dati errati (non serve con un solo utente).
- Trascina in basso per aggiornare.
- Installazione e offline (v1), sblocco con Face ID o impronta.
- Ricerca vocale, filtro per ruolo per il "giro di chiamate" (anche come suggerimenti nella ricerca vuota), filtro per regione.
- Durata dell'etichetta Nuovo e gestione delle Novità da rivedere.
- Versione PC a due colonne.

## Limiti tecnici noti (web app)
- La chiamata richiede **2 tocchi**: su iPhone compare la conferma, su Android si apre il telefono col numero già scritto.
- I Recenti non vedono le chiamate fatte fuori dall'app.
- "Salva nei contatti" passa da un file `.vcf` (2-3 tocchi).
- Su iPhone, se l'app non è installata e non viene aperta per circa 7 giorni, i dati salvati (numeri, Preferiti, Recenti) possono essere cancellati dal browser.

## Da verificare prima di pubblicare
- Su GitHub Pages, il repository deve essere pubblico (Pages su repo privati richiede un piano a pagamento): ok perché i dati sono finti.
- Il nome del repository decide l'indirizzo (`…github.io/<nome>/`) e deve coincidere con `base` in `vite.config.ts`.
