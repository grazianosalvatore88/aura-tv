# AURA TV v3.1.1

Motore EPG intelligente.

## Novità

- Motore EPG separato e più robusto.
- Indicizzazione XMLTV.
- Matching avanzato M3U ↔ EPG:
  - tvg-id;
  - tvg-name;
  - nome normalizzato;
  - alias Rai/Mediaset/La7/TV8/Nove e altri canali italiani.
- Salvataggio solo programmi utili:
  - fascia attuale;
  - oggi;
  - giorno successivo.
- Cache EPG più leggera.
- Riepilogo EPG:
  - canali M3U trovati;
  - canali EPG trovati;
  - canali abbinati;
  - canali mancanti;
  - programmi salvati.
- Loghi:
  - usa tvg-logo dalla M3U se presente;
  - usa icone XMLTV se presenti;
  - usa fallback loghi ufficiali per principali canali italiani;
  - altrimenti logo testuale elegante.
- Pulsante **Analizza EPG**.
- Pulsante **Riepilogo EPG**.

## Come usare EPG

1. Impostazioni → Sorgente TV → M3U.
2. Importa o incolla la lista M3U.
3. Inserisci URL EPG, ad esempio:
   `https://iptv-epg.org/files/epg-it.xml`
4. Premi **Analizza EPG**.
5. Premi **Riepilogo EPG** per vedere quanti canali sono stati abbinati.
6. Vai su Home o Live TV.

## Comandi

```bash
npm install
npm run dev
```

## Commit

```bash
git add .
git commit -m "Motore EPG intelligente Aura v3.1.1"
git push
```
