# 0001 — L'app fornisce nomi e ruoli, i numeri delle persone li aggiunge il Procuratore

- **Stato:** accettata (fase demo)
- **Data:** 2026-11-24

## Contesto

L'idea iniziale era una rubrica con nome, cognome e numero di telefono dello staff di ogni Club di Serie A, B e C.
Parlandone è emerso che:
- il valore principale per il Procuratore è sapere **chi** ricopre ogni Ruolo e accorgersi dei **Cambi**; il numero è secondario e spesso lui ce l'ha già;
- i cellulari dei dirigenti sono dati personali: distribuirli richiede una base giuridica, una fonte verificabile e l'informativa agli interessati (GDPR);
- i recapiti generici dei club (centralino, segreteria sportiva) servono poco a un Procuratore per la Prima squadra, mentre la segreteria del Settore giovanile serve davvero (provini, invio di materiale, documenti).

## Decisione

1. L'app fornisce **nomi, Ruoli e Cambi**, presi da fonti pubbliche verificate.
2. L'unico **Recapito del club** fornito è quello della segreteria del Settore giovanile (telefono ed email).
3. I numeri delle Persone li **aggiunge il Procuratore** e restano solo suoi. Quando li inserisce sceglie il tipo:
   - **Numero personale** (predefinito): segue la Persona se cambia Club o Ruolo;
   - **Numero di ruolo**: resta al Ruolo in quel Club.

## Alternative scartate

- **L'app fornisce i cellulari delle Persone:** è il massimo per comodità, ma ha il rischio GDPR più alto e richiede una fonte che oggi non c'è.
- **Tutti i recapiti pubblici dei club (centralino, segreteria sportiva):** occupano spazio con informazioni poco utili per la Prima squadra.
- **Il numero resta sempre al Ruolo:** quando la Persona cambia Club, il procuratore chiamerebbe la persona sbagliata.
- **Il numero segue sempre la Persona:** non copre i cellulari aziendali che restano al club.

## Conseguenze

- I dati forniti (verificati, uguali per tutti) restano separati dalla rubrica privata del Procuratore.
- Recenti e ricerca per numero funzionano solo sui Numeri aggiunti e sui Recapiti del club.
- Le Novità diventano più utili: quando una Persona con Numero personale cambia Club, il Procuratore può chiamarla subito nel nuovo ruolo.
- Per la versione vera resta da definire con un consulente privacy la base giuridica per nomi e ruoli e la gestione delle richieste di rimozione.
