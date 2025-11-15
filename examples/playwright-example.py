"""
Esempio di utilizzo dei cookie esportati con Playwright (Python)

Installazione:
    pip install playwright
    playwright install chromium

Utilizzo:
    python playwright-example.py
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from playwright.sync_api import sync_playwright


def main():
    print('🚀 Avvio test Playwright con cookie pre-caricati...\n')

    # Percorso del file di cookie esportato dall'estensione
    # Sostituisci con il tuo file effettivo
    cookie_file = './cookies_example_com_2025-11-15.json'

    # Verifica che il file esista
    if not os.path.exists(cookie_file):
        print(f'❌ Errore: File {cookie_file} non trovato!')
        print('\n📝 Per utilizzare questo esempio:')
        print('   1. Naviga al sito web desiderato')
        print('   2. Effettua il login')
        print('   3. Usa l\'estensione Chrome per esportare i cookie')
        print(f'   4. Salva il file come {cookie_file}')
        print('   5. Esegui nuovamente questo script')
        return

    try:
        # Carica la configurazione dei cookie
        with open(cookie_file, 'r') as f:
            cookie_config = json.load(f)

        print(f"✓ Caricati {len(cookie_config['cookies'])} cookie")
        print(f"✓ Dominio: {cookie_config['metadata']['domain']}")

        exported_at = datetime.fromisoformat(
            cookie_config['metadata']['exportedAt'].replace('Z', '+00:00')
        )
        print(f"✓ Esportati il: {exported_at.strftime('%d/%m/%Y %H:%M:%S')}\n")

        # Avvia Playwright
        with sync_playwright() as p:
            # Avvia il browser
            browser = p.chromium.launch(
                headless=False,  # Imposta a True per esecuzione headless
                slow_mo=100  # Rallenta le operazioni per visualizzarle meglio
            )

            # Crea il contesto con i cookie pre-caricati
            context = browser.new_context(
                storage_state=cookie_config,
                viewport={'width': 1280, 'height': 720}
            )

            # Apri una nuova pagina
            page = context.new_page()

            # Naviga al sito - l'utente sarà già autenticato!
            target_url = cookie_config['metadata']['url'].split('?')[0]
            print(f'🌐 Navigazione a {target_url}...')
            page.goto(target_url)

            print('✓ Pagina caricata - l\'utente dovrebbe essere già autenticato!\n')

            # Esempio: verifica se l'utente è autenticato
            print('🔍 Verifica autenticazione...')

            # Attendi qualche secondo per vedere la pagina
            page.wait_for_timeout(2000)

            # Puoi aggiungere qui le tue verifiche specifiche, ad esempio:
            """
            is_logged_in = page.locator('.user-profile').is_visible()
            if is_logged_in:
                print('✓ Utente autenticato correttamente!')
            else:
                print('⚠ Attenzione: l\'utente potrebbe non essere autenticato')
            """

            # Screenshot opzionale
            screenshot_path = './authenticated-page.png'
            page.screenshot(path=screenshot_path, full_page=True)
            print(f'📸 Screenshot salvato in {screenshot_path}')

            # Mantieni aperto il browser per 5 secondi
            print('\n⏳ Browser rimarrà aperto per 5 secondi...')
            page.wait_for_timeout(5000)

            # Puoi salvare nuovamente lo stato se necessario
            new_state = context.storage_state()
            updated_cookie_file = cookie_file.replace('.json', '_updated.json')
            with open(updated_cookie_file, 'w') as f:
                json.dump(new_state, f, indent=2)
            print(f'💾 Stato aggiornato salvato in {updated_cookie_file}')

            # Chiudi il browser
            browser.close()
            print('\n✅ Test completato con successo!')

    except Exception as error:
        print(f'❌ Errore durante l\'esecuzione: {error}')
        raise


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'\n{e}')
        sys.exit(1)
