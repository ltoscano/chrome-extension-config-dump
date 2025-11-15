// DOM elements
const dumpButton = document.getElementById('dumpButton');
const statusDiv = document.getElementById('status');
const currentUrlDiv = document.getElementById('currentUrl');
const cookieCountDiv = document.getElementById('cookieCount');
const allDomainsCheckbox = document.getElementById('allDomains');

let currentTab = null;

// Initialization: get current tab and show URL
async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    if (tab && tab.url) {
      const url = new URL(tab.url);
      currentUrlDiv.textContent = url.hostname;

      // Show available cookie count
      await updateCookieCount();
    } else {
      currentUrlDiv.textContent = 'No valid page';
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    currentUrlDiv.textContent = 'Loading error';
  }
}

// Update cookie count
async function updateCookieCount() {
  try {
    const url = new URL(currentTab.url);
    const cookies = await chrome.cookies.getAll({
      domain: allDomainsCheckbox.checked ? undefined : url.hostname
    });

    cookieCountDiv.textContent = `${cookies.length} cookies found`;
    cookieCountDiv.style.display = 'block';
  } catch (error) {
    console.error('Error counting cookies:', error);
  }
}

// Convert Chrome cookies to Playwright format
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

    // Add expires only if cookie is not session-only
    if (cookie.expirationDate) {
      playwrightCookie.expires = Math.floor(cookie.expirationDate);
    }

    return playwrightCookie;
  });
}

// Main function for cookie dump
async function dumpCookies() {
  try {
    // Disable button during operation
    dumpButton.disabled = true;
    dumpButton.textContent = 'Exporting...';
    statusDiv.textContent = '';
    statusDiv.className = 'status';

    if (!currentTab || !currentTab.url) {
      throw new Error('No active tab found');
    }

    const url = new URL(currentTab.url);

    // Get all cookies
    let cookies;
    if (allDomainsCheckbox.checked) {
      // Get all cookies from all domains
      cookies = await chrome.cookies.getAll({});
    } else {
      // Get only cookies from current domain
      cookies = await chrome.cookies.getAll({ domain: url.hostname });
    }

    if (cookies.length === 0) {
      statusDiv.textContent = '⚠ No cookies found for this domain';
      statusDiv.className = 'status warning';
      return;
    }

    // Convert cookies to Playwright format
    const playwrightCookies = convertCookiesToPlaywrightFormat(cookies, url.href);

    // Create configuration object
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

    // Create filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const domain = url.hostname.replace(/\./g, '_');
    const filename = `cookies_${domain}_${timestamp}.json`;

    // Convert to JSON
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);

    // Download file
    await chrome.downloads.download({
      url: downloadUrl,
      filename: filename,
      saveAs: true
    });

    // Show success message
    statusDiv.textContent = `✓ Exported ${cookies.length} cookies to ${filename}`;
    statusDiv.className = 'status success';

    // Clean up blob URL
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);

  } catch (error) {
    console.error('Error during cookie dump:', error);
    statusDiv.textContent = `✗ Error: ${error.message}`;
    statusDiv.className = 'status error';
  } finally {
    // Re-enable button
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

// Initialize when popup opens
init();
