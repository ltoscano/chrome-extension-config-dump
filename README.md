# Cookie Config Dump - Chrome Extension

Chrome extension to export current session cookies in Playwright-compatible JSON format. Perfect for automating authentication in end-to-end tests.

## Features

- Export all cookies from the current page
- Option to include cookies from all domains
- Playwright-compatible JSON format
- Direct download of configuration file
- Simple and intuitive interface
- Real-time cookie counter

## Installation

### 1. Clone or download the repository

```bash
git clone <repository-url>
cd chrome-extension-config-dump
```

### 2. Load the extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension-config-dump` directory
5. The extension should now appear in your toolbar

## Usage

### Exporting cookies

1. Navigate to the website where you want to export cookies
2. Log in or complete any necessary operations
3. Click the extension icon in the toolbar
4. (Optional) Check "Include all domains" to export cookies from all sites
5. Click "Dump Config"
6. Save the JSON file when prompted

The exported file will be named: `cookies_<domain>_<date>.json`

### Using cookies with Playwright

After exporting cookies, you can use them in your Playwright tests to bypass login:

```javascript
const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  // Load cookie configuration
  const cookieConfig = JSON.parse(fs.readFileSync('./cookies_example_com_2025-11-15.json', 'utf8'));

  // Launch browser with pre-loaded cookies
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: cookieConfig
  });

  // Open a new page - user will already be authenticated!
  const page = await context.newPage();
  await page.goto('https://example.com/dashboard');

  // User is already logged in, you can proceed with tests
  console.log('✓ Authentication completed via cookies!');

  // ... your test code ...

  await browser.close();
}

main();
```

Or in Python:

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

        print('✓ Authentication completed via cookies!')

        # ... your test code ...

        browser.close()

if __name__ == '__main__':
    main()
```

## Exported file structure

The exported JSON file contains:

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

## Development

### Project structure

```
chrome-extension-config-dump/
├── manifest.json         # Extension configuration
├── popup.html           # Popup UI
├── popup.js             # Cookie extraction logic
├── popup.css            # Interface styles
├── generate_icons.py    # Script to generate icons
├── icons/               # Icons directory
│   ├── icon.svg        # Source SVG icon
│   ├── icon16.png      # 16x16 icon
│   ├── icon48.png      # 48x48 icon
│   └── icon128.png     # 128x128 icon
├── examples/            # Usage examples
│   ├── playwright-example.js
│   └── playwright-example.py
└── README.md           # This file
```

### Modifying the extension

1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the reload button for the extension
4. Test your changes

## Security

**⚠️ IMPORTANT:** Exported cookie files contain sensitive information that allows access to your accounts.

- Never share exported cookie files
- Don't commit them to Git repositories
- Delete them when no longer needed
- Store them securely

It's recommended to add to `.gitignore`:

```
cookies_*.json
```

## Use cases

- **Automated testing:** Skip login process in E2E tests
- **Development:** Reuse authenticated sessions between restarts
- **Debugging:** Analyze cookies set by web applications
- **Migration:** Transfer sessions between different environments

## Limitations

- The extension can only access cookies visible to the browser
- Some sites may have additional protections beyond cookies (e.g., fingerprinting)
- Cookies with `HttpOnly` flag are included but may have usage limitations
- Expired cookies won't work if reloaded after expiration

## Troubleshooting

### Extension won't load

- Check Chrome console for errors
- Make sure the `manifest.json` file is valid
- Ensure all required files are present

### No cookies exported

- Verify you're on the correct page
- Some sites may not set cookies
- Try checking "Include all domains"

### Cookies don't work in Playwright

- Verify the JSON file is valid
- Make sure cookies haven't expired
- Check that the domain matches

## Contributing

Contributions, issues, and feature requests are welcome!

## License

MIT License - see LICENSE for details

## Author

Created to simplify testing and development with Playwright.
