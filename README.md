# AURA TV v3.3.3

Fix stato account Xtream e messaggi connessione.

## Correzioni

- AURA legge correttamente `user_info.status`.
- Se l'account è `Expired`, non mostra più un errore generico.
- Messaggio chiaro:
  - account riconosciuto ma scaduto;
  - scadenza formattata;
  - rinnovo/contatto fornitore.
- Se server risponde ma credenziali non sono valide, il messaggio è distinto.
- Se c'è `Failed to fetch`, il messaggio spiega proxy/mixed content/blocco rete.
- La compatibilità Xtream resta automatica e nascosta.
- AURA legge `allowed_output_formats` e salva il formato automatico preferito:
  - `m3u8` se disponibile;
  - altrimenti `ts`.
- I link stream usano il formato automatico salvato.
- In Sorgente TV compare solo il campo informativo “Formato automatico”, non una scelta manuale.
- Build verificata.

## Test con i dati Smarters

Con risposta:

```json
{
  "auth": 1,
  "status": "Expired",
  "allowed_output_formats": ["m3u8", "ts"]
}
```

AURA deve mostrare:

```text
Account riconosciuto ma scaduto...
Formato automatico: m3u8
```

## Comandi

```bash
npm install
npm run dev
```

## Commit

```bash
git add .
git commit -m "Gestisce stato Xtream Aura v3.3.3"
git push
```
