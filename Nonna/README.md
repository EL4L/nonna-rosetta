# Nonna Rosetta — anteprima MVP

Apri `index.html` nel browser, oppure esegui `node server.cjs` e visita http://127.0.0.1:4173. Non servono pacchetti, compilazione o una connessione esterna.

## Interfaccia

- Home: colonna avatar/chat, calendario sempre visibile, inviti a Ricette e Borghi.
- Il pannello di Rosetta mantiene la stessa larghezza e lo stesso meccanismo di cambio modalità su Home, Ricette e Borghi.
- La conversazione dimostrativa rimane aperta passando tra le sezioni, fino alla chiusura della pagina.
- Su desktop la sidebar termina esattamente al bordo inferiore del pannello di Rosetta. Su mobile diventa una navigazione più compatta.
- Cliccando il logo nella sidebar, il marchio ruota a medaglia tra il lato con la scritta e il ritratto di Rosetta.
- Il borgo in evidenza nella home è estratto a caso tra i borghi disponibili; al caricamento successivo ne viene scelto uno diverso dal precedente.
- Le schede Ricette e Borghi includono ricerca, filtri e dettagli dimostrativi.

## Grafica e risorse

- I colori dell'interfaccia sono definiti in `styles.css`: carta `#ECEBE4`, verde `#356D3B`, terracotta `#C4352C`, oliva `#4D5C36`, blu `#276485`, testo `#332E29`. Non sono usate sfumature sulle superfici.
- `assets/logo.jpeg` è una copia del logo fornito. Le due facce sono mostrate ritagliando la stessa immagine via CSS.
- Le icone sono Google Material Symbols, conservate localmente in `assets/material-symbols-outlined.woff2`. La licenza è in `assets/MATERIAL-SYMBOLS-LICENSE.txt`. L'icona Ricette usa il simbolo Google delle posate con un piatto circolare al centro.
- Il legno e l'avatar derivano dai mockup in `Navigazione/`. Le schede di Ricette e Borghi non contengono fotografie o ritagli dei mockup: le immagini definitive saranno realizzate a parte.
- I titoli usano Cormorant Garamond, conservato localmente in `assets/cormorant-garamond-latin.woff2` con licenza in `assets/CORMORANT-GARAMOND-LICENSE.txt`. Il testo corrente usa Georgia. Non è stato fornito il font originale dei mockup.

## File principali

- `index.html`: struttura della pagina.
- `styles.css`: stile e adattamento responsive.
- `app.js`: navigazione, stato della chat, calendario, ricerca e dati dimostrativi.
- `server.cjs`: server locale facoltativo, limitato a localhost.

La chat usa risposte predefinite e non invia messaggi a servizi esterni. Audio, avatar animato, account e traduzione inglese richiedono integrazioni successive. Il microfono mostra un avviso e non chiede permessi. Il calendario mostra la data corrente in Europe/Rome; il detto e i contenuti editoriali restano campioni da completare prima della pubblicazione.
