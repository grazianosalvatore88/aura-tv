# AURA TV v3.0.4

Aggiornamento con modalità sorgente neutra.

## Novità

- Aggiunta modalità **Lista con link**.
- Campi:
  - Nome lista
  - Link
  - Username
  - Password
- Compatibilità neutra:
  - Auto
  - Standard
  - Alta
  - Diretta
  - Web
- Nessun riferimento visibile a nomi di app o provider esterni.
- Tentativi automatici:
  - API standard;
  - lista generata;
  - output mpegts;
  - output m3u8;
  - porte comuni;
  - HTTP/HTTPS;
  - profili di richiesta diversi.
- Il motore AURA Live continua a:
  - leggere la lista;
  - pulire nomi;
  - riconoscere qualità;
  - unire doppioni;
  - creare categorie;
  - aprire lo stream nel player.

## Come provarla

1. Vai su **Impostazioni**.
2. Vai su **Sorgente TV**.
3. Seleziona **Lista con link**.
4. Inserisci:
   - Nome lista
   - Link
   - Username
   - Password
5. Lascia **Compatibilità: Auto**.
6. Clicca **Test connessione**.
7. Clicca **Salva sorgente**.
8. Clicca **Aggiorna lista**.
9. Vai su **Live TV**.

Se Auto non va, prova:

- Alta
- Diretta
- Standard
- Web

## Comandi

```bash
npm install
npm run dev
```

Dopo aver sostituito i file:

```bash
git add .
git commit -m "Lista con link e compatibilita neutra Aura v3.0.4"
git push
```
