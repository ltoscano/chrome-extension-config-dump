# Esempi di utilizzo

Questa directory contiene esempi pratici di come utilizzare i cookie esportati con Playwright.

## File disponibili

- `playwright-example.js` - Esempio in JavaScript/Node.js
- `playwright-example.py` - Esempio in Python

## Prerequisiti

### Per JavaScript

```bash
npm install playwright
npx playwright install chromium
```

### Per Python

```bash
pip install playwright
playwright install chromium
```

## Come usare gli esempi

1. **Esporta i cookie** usando l'estensione Chrome:
   - Naviga al sito web desiderato
   - Effettua il login
   - Clicca sull'icona dell'estensione
   - Clicca su "Dump Config"
   - Salva il file JSON

2. **Sposta il file** nella directory degli esempi o aggiorna il percorso nel codice

3. **Esegui l'esempio**:

   JavaScript:
   ```bash
   node playwright-example.js
   ```

   Python:
   ```bash
   python playwright-example.py
   ```

## Personalizzazione

Gli esempi sono pensati come punto di partenza. Puoi personalizzarli per:

- Aggiungere verifiche specifiche di autenticazione
- Eseguire azioni automatizzate
- Creare suite di test complesse
- Salvare e aggiornare lo stato della sessione

## Suggerimenti

- Imposta `headless: true` (o `headless=True` in Python) per esecuzione senza GUI
- Usa `slow_mo` per rallentare le operazioni durante il debug
- Salva nuovamente lo stato per aggiornare i cookie dopo operazioni importanti
- Verifica sempre che i cookie non siano scaduti prima di utilizzarli

## Risoluzione problemi

### I cookie non funzionano

- Verifica che non siano scaduti
- Controlla che il dominio corrisponda
- Alcuni siti potrebbero richiedere ulteriori verifiche di sicurezza

### Errori di autenticazione

- I cookie potrebbero essere legati all'IP o al device fingerprint
- Prova a esportare nuovamente i cookie
- Verifica che tutti i cookie necessari siano stati esportati
