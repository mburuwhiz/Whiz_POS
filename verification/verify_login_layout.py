from playwright.sync_api import sync_playwright

def verify_login_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto('http://localhost:5174')
            page.wait_for_selector('text=Whiz POS')

            # Check footer
            footer = page.wait_for_selector('text=Developed and managed by Whiz Tech KE')

            # Check button
            button = page.locator('button:has-text("Access POS")')

            # Take screenshot
            page.screenshot(path='verification/login_layout.png')
            print("Screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_login_layout()
