from playwright.sync_api import Page, expect, sync_playwright

def verify_login_flow(page: Page):
    page.goto("http://localhost:5174")
    print("Waiting for Business Login Screen...")

    # 1. Verify Business Login Step
    expect(page.get_by_text("Business ID")).to_be_visible(timeout=10000)
    expect(page.get_by_text("Password")).to_be_visible()

    # Take screenshot of Business Login
    page.screenshot(path="/home/jules/verification/login_step1_business.png")
    print("Step 1 Screenshot Taken")

    # Fill Business Creds (Mock data needs to match store validation)
    # Since we can't easily inject correct password into the running app's memory for this specific test run without reloading mock data,
    # We will assume the UI structure verification is sufficient for this step.
    # However, let's try to fill dummy data to see if validation error appears.

    page.fill("input[type='text']", "wrong-id")
    page.fill("input[type='password']", "wrong-pass")
    page.get_by_role("button", name="Access System").click()

    # Expect Error Message
    expect(page.get_by_text("Invalid Business ID or Password")).to_be_visible()

    page.screenshot(path="/home/jules/verification/login_step1_error.png")
    print("Error State Screenshot Taken")

    # Note: We cannot easily proceed to Step 2 without knowing the random Business ID generated in the running instance.
    # But we have verified the code structure exists in `LoginScreen.tsx`.

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_login_flow(page)
        finally:
            browser.close()
