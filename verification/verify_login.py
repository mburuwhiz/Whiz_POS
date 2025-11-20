from playwright.sync_api import Page, expect, sync_playwright

def verify_login_page(page: Page):
    page.goto("http://localhost:5174")

    # Since we have mock data, the app will likely start at the Login Screen (because isSetup=true in mock data)
    # We need to verify the NEW Login UI which asks for Business ID and Password

    # Wait for the new Login UI elements
    print("Waiting for Login Screen...")

    # Check for "Business ID" input
    try:
        # The new login screen has "Business ID" label
        expect(page.get_by_text("Business ID")).to_be_visible(timeout=10000)

        # Fill in mock data (from mock API or just checking UI)
        # In mock, we might not have updated the business-setup.json yet with the new password field,
        # so actual login might fail or fallback.
        # Our goal here is to verify the UI appearance.

        page.fill("input[type='text']", "123456")
        page.fill("input[type='password']", "password")

        # Take screenshot of the new "Ultra Modern" Login Screen
        page.screenshot(path="/home/jules/verification/login_screen_modern.png")
        print("Login Screen Screenshot Taken")

    except Exception as e:
        print(f"Verification Failed: {e}")
        # Take screenshot of whatever is there to debug
        page.screenshot(path="/home/jules/verification/login_failure.png")
        raise e

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_login_page(page)
        finally:
            browser.close()
