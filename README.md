# AURA TV v2.5

AURA TV è un prototipo React/Vite di interfaccia TV premium.

## Novità v2.5

- Pulizia pagina **Sport**:
  - rimossi testi esplicativi visibili sul riconoscimento automatico;
  - rimosso il pannello “Info riconoscimento”;
  - rimosso il filtro “Prossimamente”;
  - rimosse le sezioni e le card “Prossimamente”;
  - sezione **Live ora** con logo canale a sinistra;
  - sezione **Canali sportivi** senza percentuali o dettagli tecnici.
- Aggiunta pagina **Impostazioni**.
- Il tasto impostazioni nella topbar apre la pagina Impostazioni da qualsiasi pagina.
- Blocchi impostazioni:
  - Sorgente TV;
  - Player;
  - Aspetto;
  - Premium;
  - Privacy;
  - Sistema.
- Legenda telecomando nella pagina Impostazioni.

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
git commit -m "Aggiunta Impostazioni e pulizia Sport Aura v2.5"
git push
```
