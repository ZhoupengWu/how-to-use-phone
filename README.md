# Simulatore Telefono

Simulatore interattivo di smartphone in HTML, CSS e JavaScript. Permette di sperimentare le funzioni base di un telefono (accensione, blocco, messaggi, chiamate, fotocamera, impostazioni) direttamente nel browser.

![Lingua](https://img.shields.io/badge/lingua-italiano-blue)  
![Licenza](https://img.shields.io/badge/licenza-Apache%202.0-green)

## Funzionalità

- **Accensione e boot** — Pulsante di accensione, schermata di avvio “PhoneOS” e poi schermata di blocco
- **Schermata di blocco** — Inserimento PIN (predefinito: `1234`) per sbloccare
- **Home** — Griglia di app: Messaggi, Telefono, Impostazioni, Fotocamera
- **Messaggi** — Lista conversazioni, nuova chat, invio messaggi, scelta destinatario da contatti
- **Telefono** — Tastierino, elenco contatti, avvio chiamata, schermata chiamata con vivavoce, mute, tastierino DTMF, aggiungi a contatti, termina
- **Impostazioni** — Tema (chiaro), suono avvio, vibrazione, volume
- **Fotocamera** — Scatto foto (anteriore/posteriore), flash, galleria

## Struttura del progetto

```
how-to-use-phone/
├── index.html   # Markup e struttura delle schermate
├── style.css    # Stili e layout (telefono, app, componenti)
├── script.js    # Logica: navigazione, PIN, messaggi, chiamate, contatti, fotocamera, impostazioni
├── LICENSE      # Apache License 2.0
└── README.md
```

## Come usare

1. Apri `index.html` in un browser (doppio clic o “Apri con” il browser).
2. Clicca sul pulsante **⚡** per accendere il telefono.
3. Attendi il boot, poi inserisci il PIN **1234** per sbloccare.
4. Dalla home tocca le icone per aprire Messaggi, Telefono, Impostazioni o Fotocamera.

Nessun server né build: funziona come pagina statica.

## Requisiti

- Un browser moderno (Chrome, Firefox, Safari, Edge).
- Nessuna dipendenza esterna: solo file locali.

## Tecnologie

- **HTML5** — Struttura delle schermate e dei componenti
- **CSS3** — Layout, animazioni, tema chiaro, design tipo smartphone
- **JavaScript (vanilla)** — Stato dell’app, gestione schermate, logica delle singole app

## Licenza

Il progetto è rilasciato sotto [Apache License 2.0](LICENSE).
