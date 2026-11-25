# CLAUDE.md — Chi è Chi

## Il progetto
Demo di una web app mobile per **un procuratore sportivo**: sapere chi ricopre ogni ruolo (DS, allenatori, responsabili del vivaio) nei club di Serie A, B e C, accorgersi dei cambi e contattare chi ha già in rubrica.
La demo verrà mandata al procuratore come link su WhatsApp. Se convince, diventa la **base dell'app vera**: un backend (Java / Spring Boot) verrà costruito sotto più avanti.

## Documenti da leggere prima di scrivere codice
1. `docs/DEMO-SPEC.md` — cosa fa la demo, schermate, dettagli di interazione, cosa è fuori scope.
2. `DESIGN.md` — colori, tipografia, componenti, animazioni, cose da fare e da evitare.
3. `CONTEXT.md` — glossario del dominio. Usa **questi termini** nel codice e nell'interfaccia (Persona, Ruolo, Cambio, Novità, Numero aggiunto, Recapito del club…).
4. `docs/adr/` — decisioni difficili da cambiare (es. 0001: l'app non fornisce mai numeri delle persone).

Se una richiesta contraddice questi documenti, segnalalo prima di procedere. Se un termine viene chiarito, aggiorna `CONTEXT.md`.

## Tecnologia
- React + TypeScript + Vite.
- Pubblicazione su **GitHub Pages** (repository pubblico `chi_e_chi`). In `vite.config.ts` il `base` deve essere `/chi_e_chi/`.
- GitHub Pages non gestisce gli indirizzi delle app a pagina singola: proponi tu la soluzione (es. HashRouter, oppure fallback con `404.html`) spiegando il compromesso, e aspetta la scelta.
- Tutte le schermate leggono i dati **solo** da un "servizio dati" (un'interfaccia TypeScript). Nella demo l'implementazione legge un file JSON finto; nell'app vera chiamerà le API del backend. Le schermate non devono sapere da dove arrivano i dati.
- I dati del procuratore (Numeri aggiunti, Preferiti, Recenti, ricerche recenti) stanno solo sul telefono (localStorage/IndexedDB), con letture e scritture protette da try/catch.
- Nessun nome dell'app a schermo, nessun logo ufficiale dei club, nessuna persona reale: tutte le persone e tutti i numeri sono inventati.

## Dati demo
16 club con **nomi reali** della stagione in corso: 5 di Serie A, 5 di Serie B, 6 di Serie C (2 per girone). Prima di usarli, **verifica la composizione della stagione 2026-27 con una ricerca web e mostrami l'elenco**: lo confermo io.

## Come lavorare con me
- Parla sempre in **italiano**.
- Procedi **un passo per volta**: proponi cosa stai per fare e aspetta il mio "via" prima dei passaggi importanti.
- Spiega le modifiche e le scelte in modo tecnico ma non troppo, anche con la logica di business dietro.
- I comandi da eseguire vanno scritti per **PowerShell** (Windows). Niente `if {...}` con `else` sulla riga dopo: comandi singoli, o `} else {` sulla stessa riga.
- Alla fine di ogni risposta operativa: **riepilogo passo passo numerato**, con comandi pronti da copiare e, per ogni passo, cosa devo vedere.
- **Non fare commit, push o pubblicazioni senza la mia conferma esplicita.**
- Distingui quando serve: cosa hai **verificato**, cosa **deduci**, cosa **non sai**.
