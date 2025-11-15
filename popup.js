// Elementi DOM
const dumpButton = document.getElementById('dumpButton');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');
const cookieCountDiv = document.getElementById('cookieCount');
const allDomainsCheckbox = document.getElementById('allDomains');

let currentTab = null;

// Inizializzazione: ottiene il tab corrente e mostra l'URL
async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    if (tab && tab.url) {
      const url = new URL(tab.url);
      currentUrlDiv.textContent = url.hostname;

      // Mostra il numero di cookie disponibili
      await updateCookieCount();
    } else {
      currentUrlDiv.textContent = 'Nessuna pagina valida';
    }
  } catch (error) {
    console.error('Errore durante l\'inizializzazione:', error);
    currentUrlDiv.textContent = 'Errore nel caricamento';
  }
}

// Aggiorna il conteggio dei cookie
async function updateCookieCount() {
  try {
    const url = new URL(currentTab.url);
    const cookies = await chrome.cookies.getAll({
      domain: allDomainsCheckbox.checked ? undefined : url.hostname
    });

    cookieCountDiv.textContent = `${cookies.length} cookie trovati`;
    cookieCountDiv.style.display = 'block';
  } catch (error) {
    console.error('Errore nel conteggio dei cookie:', error);
  }
}

// Converte i cookie di Chrome nel formato Playwright
function convertCookiesToPlaywrightFormat(cookies, url) {
  return cookies.map(cookie => {
    const playwrightCookie = {
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite === 'unspecified' ? 'Lax' :
                cookie.sameSite === 'no_restriction' ? 'None' :
                cookie.sameSite.charAt(0).toUpperCase() + cookie.sameSite.slice(1)
    };

    // Aggiungi expires solo se il cookie non è di sessione
    if (cookie.expirationDate) {
      playwrightCookie.expires = Math.floor(cookie.expirationDate);
    }

    return playwrightCookie;
  });
}

// Funzione principale per il dump dei cookie
async function dumpCookies() {
  try {
    // Disabilita il pulsante durante l'operazione
    dumpButton.disabled = true;
    dumpButton.textContent = 'Esportazione in corso...';
    statusDiv.textContent = '';
    statusDiv.className = 'status';

    if (!currentTab || !currentTab.url) {
      throw new Error('Nessun tab attivo trovato');
    }

    const url = new URL(currentTab.url);

    // Ottiene tutti i cookie
    let cookies;
    if (allDomainsCheckbox.checked) {
      // Ottiene tutti i cookie di tutti i domini
      cookies = await chrome.cookies.getAll({});
    } else {
      // Ottiene solo i cookie del dominio corrente
      cookies = await chrome.cookies.getAll({ domain: url.hostname });
    }

    if (cookies.length === 0) {
      statusDiv.textContent = '⚠ Nessun cookie trovato per questo dominio';
      statusDiv.className = 'status warning';
      return;
    }

    // Converte i cookie nel formato Playwright
    const playwrightCookies = convertCookiesToPlaywrightFormat(cookies, url.href);

    // Crea l'oggetto di configurazione
    const config = {
      cookies: playwrightCookies,
      origins: [{
        origin: url.origin,
        localStorage: []
      }],
      metadata: {
        exportedAt: new Date().toISOString(),
        url: url.href,
        domain: url.hostname,
        cookieCount: cookies.length,
        allDomains: allDomainsCheckbox.checked
      }
    };

    // Crea il nome del file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const domain = url.hostname.replace(/\./g, '_');
    const filename = `cookies_${domain}_${timestamp}.json`;

    // Converte in JSON
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);

    // Scarica il file
    await chrome.downloads.download({
      url: downloadUrl,
      filename: filename,
      saveAs: true
    });

    // Mostra messaggio di successo
    statusDiv.textContent = `✓ Esportati ${cookies.length} cookie in ${filename}`;
    statusDiv.className = 'status success';

    // Pulisce l'URL del blob
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

  } catch (error) {
    console.error('Errore durante il dump dei cookie:', error);
    statusDiv.textContent = `✗ Errore: ${error.message}`;
    statusDiv.className = 'status error';
  } finally {
    // Riabilita il pulsante
    dumpButton.disabled = false;
    dumpButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Dump Config
    `;
  }
}

// Event listeners
dumpButton.addEventListener('click', dumpCookies);
allDomainsCheckbox.addEventListener('change', updateCookieCount);

// Inizializza quando il popup viene aperto
init();
