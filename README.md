# AURA TV v2.10

AURA TV è un prototipo React/Vite di interfaccia TV premium.

## Novità v2.10

- Ultima rifinitura grafica prima dell'avvio del motore AURA.
- Nella Home, le sezioni:
  - Film più visti;
  - Serie TV più viste;
  ora usano le stesse icone della sidebar.
- Creata icona condivisa `SidebarIcon.jsx` per mantenere coerenza grafica.
- Sidebar aggiornata per usare le stesse icone condivise.
- Rimossi gli emoji dai titoli dei caroselli Film/Serie.

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
git commit -m "Rifinitura icone Home Aura v2.10"
git push
```

## Prossimo passo consigliato

Dalla prossima fase si può iniziare con il collegamento reale Xtream e con il primo motore AURA sui canali Live TV.
