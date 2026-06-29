# AURA TV v2.3

AURA TV è un prototipo React/Vite di interfaccia TV premium.

## Novità v2.3

- Correzione definitiva pagine **Preferiti** e **Riprendi**.
- Rimossa completamente la hero da **Preferiti**.
- Rimossa completamente la hero da **Riprendi**.
- Preferiti e Riprendi ora partono direttamente con titolo, filtri e contenuti.
- Card dei canali preferiti rese più compatte.
- Griglia canali preferiti impostata per mostrare fino a 6 canali per riga su desktop.
- Rimosso il vecchio quadrato rosso con cuore.
- Nuovo cuore rosa piccolo e pulito sui canali preferiti.
- Sostituzione delle icone Info poco nitide con testo **Info**.
- Aggiornate le legende telecomando con testo **Info** dove necessario.
- Pulizia classi e override CSS per evitare che vecchie hero o vecchie card vengano mostrate.

## Pagine presenti

- Home
- Preferiti
- Live TV
- Film
- Serie TV
- Sport
- Riprendi

## Comandi

Installazione dipendenze:

```bash
npm install
```

Avvio sviluppo:

```bash
npm run dev
```

Build produzione:

```bash
npm run build
```

## Note

Il pacchetto è pulito e non contiene:

- node_modules
- dist
- .git
- .DS_Store

Dopo aver sostituito i file nel repository, eseguire:

```bash
npm install
git add .
git commit -m "Fix definitivo Preferiti e Riprendi Aura v2.3"
git push
```

Se il browser mostra ancora la vecchia interfaccia, effettuare un refresh forzato o attendere il nuovo deploy Vercel.
