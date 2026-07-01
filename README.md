# AURA TV v3.3.2

Fix stabilità riproduzione StreamVideo.

## Correzione principale

In `StreamVideo.jsx` il player HLS/DASH non viene più distrutto e ricreato quando premi Pausa o Muto.

Prima l'effetto principale aveva `muted` e `paused` nelle dipendenze:

```js
[activeSrc, fallbackSrc, failedPrimary, muted, onStatusChange, paused, streamType]
```

Ora usa:

```js
[activeSrc, fallbackSrc, failedPrimary, onStatusChange, streamType]
```

## Altre correzioni collegate

- `muted` resta gestito dall'effetto dedicato.
- `paused` resta gestito dall'effetto dedicato.
- Resume/play ora funziona anche per DASH, non solo per sorgenti non-DASH.
- HLS avvia il play dopo `MANIFEST_PARSED`, se il player non è in pausa.
- Build verificata.

## Note tecniche da ricordare

- Gli stream HTTP possono essere bloccati se la pagina è servita in HTTPS per mixed content.
- Con Xtream API attualmente vengono caricati i canali live; VOD/Serie API richiedono chiamate dedicate.
- In sviluppo React StrictMode può eseguire effetti due volte; in build produzione non accade.

## Comandi

```bash
npm install
npm run dev
```

## Commit

```bash
git add .
git commit -m "Fix stabilità StreamVideo Aura v3.3.2"
git push
```
