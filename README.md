# AURA TV v3.3.4 - LG webOS Test Build

Versione preparata per test su TV LG webOS.

## Cosa contiene

- Tutte le correzioni fino alla v3.3.3.
- Script per generare la cartella `webos`.
- File `appinfo.json` generato automaticamente.
- Comandi npm per build, package, installazione e lancio su LG TV.
- Build Vite verificata.

## Prima installazione strumenti LG

Installa la CLI webOS:

```bash
npm install -g @webos-tools/cli
```

Poi verifica:

```bash
ares --version
```

## Sulla TV LG

1. Installa l'app **Developer Mode** dallo store LG.
2. Accedi con account LG Developer.
3. Attiva **Dev Mode Status**.
4. Riavvia la TV.
5. Riapri Developer Mode e segnati:
   - IP TV
   - porta SSH
   - passphrase/key server

La TV e il PC devono essere sulla stessa rete.

## Collegare la TV al PC

Esegui:

```bash
ares-setup-device
```

Scegli `add` e crea un dispositivo, per esempio:

```text
nome dispositivo: aura-lg-tv
host/ip: IP della TV
port: porta indicata dalla TV
username: prisoner
```

Poi verifica:

```bash
ares-device-info --device aura-lg-tv
```

## Creare il pacchetto LG

Nel progetto:

```bash
npm install
npm run build:webos
ares-package webos
```

Oppure:

```bash
npm run package:webos
```

Questo crea un file tipo:

```text
com.aura.tv_1.0.0_all.ipk
```

## Installare sulla TV

```bash
ares-install --device aura-lg-tv com.aura.tv_1.0.0_all.ipk
```

## Avviare sulla TV

```bash
ares-launch --device aura-lg-tv com.aura.tv
```

## Comandi rapidi

```bash
npm install
npm run build:webos
ares-package webos
ares-install --device aura-lg-tv com.aura.tv_1.0.0_all.ipk
ares-launch --device aura-lg-tv com.aura.tv
```

## Test da fare sulla TV

- Apertura app.
- Navigazione menu col telecomando.
- Impostazioni > Sorgente TV.
- Inserimento Xtream.
- Test connessione.
- Messaggio account Active/Expired.
- Caricamento canali.
- Apertura player.
- Play/pausa.
- Muto.
- Zapping.
- Layout su 1920x1080.

## Nota importante

Questa è una web app pacchettizzata per webOS. Se il server IPTV usa HTTP, la TV potrebbe comportarsi meglio rispetto a browser HTTPS/Vercel, ma eventuali blocchi IP o limitazioni del provider possono comunque rimanere.
