# AURA TV v2.9

AURA TV è un prototipo React/Vite di interfaccia TV premium.

## Novità v2.9

- Correzione definitiva pagina **Live TV**.
- Sistemato errore che poteva causare schermata nera entrando in Live TV.
- Player: tasto **BACK** spostato in alto a sinistra, allineato alle icone in alto a destra.
- Titolo contenuto nel player posizionato sotto al tasto BACK con più respiro.
- Icona impostazioni del player semplificata e resa più pulita.
- Scheda comandi player ulteriormente abbassata e resa più compatta.
- Play/pausa mantenuti centrati.
- Pausa con due barre dritte uguali.
- Audio con icona cassa speaker.
- Tasti colorati coerenti con il resto dell’app.

## Pagine presenti

- Home
- Preferiti
- Live TV
- Film
- Serie TV
- Sport
- Riprendi
- Impostazioni

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

Dopo aver sostituito i file nel repository:

```bash
npm install
git add .
git commit -m "Fix Live TV e player Aura v2.9"
git push
```
