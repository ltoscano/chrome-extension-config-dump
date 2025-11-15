# Cookie Config Dump - Estensione Chrome

Estensione Chrome per esportare i cookie della sessione corrente in formato JSON compatibile con Playwright. Ideale per automatizzare l'autenticazione nei test end-to-end.

## Caratteristiche

- Esporta tutti i cookie della pagina corrente
- Opzione per includere cookie di tutti i domini
- Formato JSON compatibile con Playwright
- Download diretto del file di configurazione
- Interfaccia semplice e intuitiva
- Contatore di cookie in tempo reale

## Installazione

### 1. Clona o scarica il repository

```bash
git clone <repository-url>
cd chrome-extension-config-dump
```

### 2. Genera le icone

L'estensione richiede icone PNG nelle dimensioni 16x16, 48x48 e 128x128 pixel.

#### Opzione A: Usando Python (consigliato)

```bash
# Installa Pillow se necessario
pip install Pillow

# Genera le icone
python3 generate_icons.py
```

#### Opzione B: Usando ImageMagick

```bash
cd icons
convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

#### Opzione C: Manualmente

Crea tre file PNG (16x16, 48x48, 128x128) e salvali nella directory `icons/` con i nomi:
- `icon16.png`
- `icon48.png`
- `icon128.png`

### 3. Carica l'estensione in Chrome

1. Apri Chrome e vai su `chrome://extensions/`
2. Attiva la "Modalità sviluppatore" (interruttore in alto a destra)
3. Clicca su "Carica estensione non pacchettizzata"
4. Seleziona la directory `chrome-extension-config-dump`
5. L'estensione dovrebbe ora apparire nella barra degli strumenti

## Utilizzo

### Esportare i cookie

1. Naviga al sito web dove vuoi esportare i cookie
2. Effettua il login o completa le operazioni necessarie
3. Clicca sull'icona dell'estensione nella barra degli strumenti
4. (Opzionale) Seleziona "Includi tutti i domini" per esportare cookie da tutti i siti
5. Clicca su "Dump Config"
6. Salva il file JSON quando richiesto

Il file esportato avrà un nome nel formato: `cookies_<dominio>_<data>.json`

### Utilizzare i cookie con Playwright

Dopo aver esportato i cookie, puoi utilizzarli nei tuoi test Playwright per bypassare il login:

```javascript
const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  // Carica la configurazione dei cookie
  const cookieConfig = JSON.parse(fs.readFileSync('./cookies_example_com_2025-11-15.json', 'utf8'));

  // Avvia il browser con i cookie pre-caricati
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: cookieConfig
  });

  // Apri una nuova pagina - l'utente sarà già autenticato!
  const page = await context.newPage();
  await page.goto('https://example.com/dashboard');

  // L'utente è già loggato, puoi procedere con i test
  console.log('✓ Autenticazione completata tramite cookie!');

  // ... il tuo codice di test ...

  await browser.close();
}

main();
```

Oppure in Python:

```python
from playwright.sync_api import sync_playwright
import json

def main():
    with open('./cookies_example_com_2025-11-15.json', 'r') as f:
        cookie_config = json.load(f)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(storage_state=cookie_config)

        page = context.new_page()
        page.goto('https://example.com/dashboard')

        print('✓ Autenticazione completata tramite cookie!')

        # ... il tuo codice di test ...

        browser.close()

if __name__ == '__main__':
    main()
```

## Struttura del file esportato

Il file JSON esportato contiene:

```json
{
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123...",
      "domain": ".example.com",
      "path": "/",
      "expires": 1234567890,
      "httpOnly": true,
      "secure": true,
      "sameSite": "Lax"
    }
  ],
  "origins": [
    {
      "origin": "https://example.com",
      "localStorage": []
    }
  ],
  "metadata": {
    "exportedAt": "2025-11-15T12:00:00.000Z",
    "url": "https://example.com/login",
    "domain": "example.com",
    "cookieCount": 5,
    "allDomains": false
  }
}
```

## Sviluppo

### Struttura del progetto

```
chrome-extension-config-dump/
├── manifest.json         # Configurazione dell'estensione
├── popup.html           # Interfaccia utente del popup
├── popup.js             # Logica per l'estrazione dei cookie
├── popup.css            # Stili dell'interfaccia
├── generate_icons.py    # Script per generare le icone
├── icons/               # Directory delle icone
│   ├── icon.svg        # Icona SVG sorgente
│   ├── icon16.png      # Icona 16x16
│   ├── icon48.png      # Icona 48x48
│   └── icon128.png     # Icona 128x128
└── README.md           # Questo file
```

### Modificare l'estensione

1. Modifica i file sorgente
2. Vai su `chrome://extensions/`
3. Clicca sul pulsante di ricarica dell'estensione
4. Testa le modifiche

## Sicurezza

**⚠️ IMPORTANTE:** I file di cookie esportati contengono informazioni sensibili che permettono di accedere ai tuoi account.

- Non condividere mai i file di cookie esportati
- Non commitarli nei repository Git
- Eliminali quando non sono più necessari
- Conservali in modo sicuro

Si consiglia di aggiungere al `.gitignore`:

```
cookies_*.json
```

## Casi d'uso

- **Testing automatizzato:** Salta il processo di login nei test E2E
- **Sviluppo:** Riutilizza sessioni autenticate tra riavvii
- **Debugging:** Analizza i cookie impostati dalle applicazioni web
- **Migrazione:** Trasferisci sessioni tra ambienti diversi

## Limitazioni

- L'estensione può accedere solo ai cookie visibili al browser
- Alcuni siti potrebbero avere protezioni aggiuntive oltre ai cookie (es. fingerprinting)
- I cookie con flag `HttpOnly` sono inclusi ma possono avere limitazioni d'uso
- I cookie scaduti non funzioneranno se ricaricati dopo la scadenza

## Risoluzione problemi

### L'estensione non si carica

- Verifica che tutte le icone PNG siano presenti nella directory `icons/`
- Controlla la console di Chrome per eventuali errori
- Assicurati che il file `manifest.json` sia valido

### Non vengono esportati cookie

- Verifica di essere sulla pagina corretta
- Alcuni siti potrebbero non impostare cookie
- Prova a selezionare "Includi tutti i domini"

### I cookie non funzionano in Playwright

- Verifica che il file JSON sia valido
- Assicurati che i cookie non siano scaduti
- Controlla che il dominio corrisponda

## Contribuire

Contributi, issue e feature request sono benvenuti!

## Licenza

MIT License - vedi LICENSE per dettagli

## Autore

Creato per semplificare il testing e lo sviluppo con Playwright.
