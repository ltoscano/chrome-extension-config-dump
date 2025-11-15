/**
 * Esempio di utilizzo dei cookie esportati con Playwright (JavaScript/Node.js)
 *
 * Installazione:
 *   npm install playwright
 *
 * Utilizzo:
 *   node playwright-example.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Avvio test Playwright con cookie pre-caricati...\n');

  // Percorso del file di cookie esportato dall'estensione
  // Sostituisci con il tuo file effettivo
  const cookieFile = './cookies_example_com_2025-11-15.json';

  // Verifica che il file esista
  if (!fs.existsSync(cookieFile)) {
    console.error(`❌ Errore: File ${cookieFile} non trovato!`);
    console.log('\n📝 Per utilizzare questo esempio:');
    console.log('   1. Naviga al sito web desiderato');
    console.log('   2. Effettua il login');
    console.log('   3. Usa l\'estensione Chrome per esportare i cookie');
    console.log('   4. Salva il file come ' + cookieFile);
    console.log('   5. Esegui nuovamente questo script');
    return;
  }

  try {
    // Carica la configurazione dei cookie
    const cookieConfig = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));

    console.log(`✓ Caricati ${cookieConfig.cookies.length} cookie`);
    console.log(`✓ Dominio: ${cookieConfig.metadata.domain}`);
    console.log(`✓ Esportati il: ${new Date(cookieConfig.metadata.exportedAt).toLocaleString()}\n`);

    // Avvia il browser
    const browser = await chromium.launch({
      headless: false, // Imposta a true per esecuzione headless
      slowMo: 100 // Rallenta le operazioni per visualizzarle meglio
    });

    // Crea il contesto con i cookie pre-caricati
    const context = await browser.newContext({
      storageState: cookieConfig,
      viewport: { width: 1280, height: 720 }
    });

    // Apri una nuova pagina
    const page = await context.newPage();

    // Naviga al sito - l'utente sarà già autenticato!
    const targetUrl = cookieConfig.metadata.url.split('?')[0]; // Rimuove query params
    console.log(`🌐 Navigazione a ${targetUrl}...`);
    await page.goto(targetUrl);

    console.log('✓ Pagina caricata - l\'utente dovrebbe essere già autenticato!\n');

    // Esempio: verifica se l'utente è autenticato cercando elementi comuni
    console.log('🔍 Verifica autenticazione...');

    // Attendi qualche secondo per vedere la pagina
    await page.waitForTimeout(2000);

    // Puoi aggiungere qui le tue verifiche specifiche, ad esempio:
    /*
    const isLoggedIn = await page.locator('.user-profile').isVisible();
    if (isLoggedIn) {
      console.log('✓ Utente autenticato correttamente!');
    } else {
      console.log('⚠ Attenzione: l\'utente potrebbe non essere autenticato');
    }
    */

    // Screenshot opzionale
    const screenshotPath = './authenticated-page.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot salvato in ${screenshotPath}`);

    // Mantieni aperto il browser per 5 secondi per visualizzare il risultato
    console.log('\n⏳ Browser rimarrà aperto per 5 secondi...');
    await page.waitForTimeout(5000);

    // Puoi salvare nuovamente lo stato se necessario
    const newState = await context.storageState();
    const updatedCookieFile = cookieFile.replace('.json', '_updated.json');
    fs.writeFileSync(updatedCookieFile, JSON.stringify(newState, null, 2));
    console.log(`💾 Stato aggiornato salvato in ${updatedCookieFile}`);

    // Chiudi il browser
    await browser.close();
    console.log('\n✅ Test completato con successo!');

  } catch (error) {
    console.error('❌ Errore durante l\'esecuzione:', error.message);
    throw error;
  }
}

// Esegui il main
main().catch(error => {
  console.error(error);
  process.exit(1);
});
