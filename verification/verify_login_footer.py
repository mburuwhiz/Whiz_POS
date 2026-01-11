from playwright.sync_api import sync_playwright

def verify_login_footer():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto('http://localhost:5174')
            page.wait_for_selector('text=Whiz POS')

            # Check for footer text
            page.wait_for_selector('text=Developed and managed by Whiz Tech KE')

            # Take screenshot
            page.screenshot(path='verification/login_footer.png')
            print("Screenshot taken")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_login_footer()
