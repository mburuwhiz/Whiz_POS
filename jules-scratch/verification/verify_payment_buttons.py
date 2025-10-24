from playwright.sync_api import sync_playwright

def run(playwright):
    electron_app = playwright.electron.launch(executable_path='./desktop/node_modules/.bin/electron', args=['./desktop/electron/main.js'])
    page = electron_app.first_window()

    # Log in
    page.select_option('select', 'Jane Cashier')
    page.click('button:has-text("1")')
    page.click('button:has-text("2")')
    page.click('button:has-text("3")')
    page.click('button:has-text("4")')
    page.click('button:has-text("Enter")')

    # Add an item to the cart
    page.click('button:has-text("Espresso")')

    # Take a screenshot of the action panel
    page.locator('.action-panel').screenshot(path='jules-scratch/verification/verification.png')

    electron_app.close()

with sync_playwright() as playwright:
    run(playwright)
