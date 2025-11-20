
from playwright.sync_api import Page, expect, sync_playwright

def verify_manage_page(page: Page):
    # 1. Navigate to the app
    page.goto("http://localhost:5174")

    # Wait for initial data loading
    # The app starts at BusinessRegistration if setup is false, or Login if true
    # Mock data in public/data should make it true.

    # Assuming we are at Login Screen
    # Wait for the user select to be visible
    try:
        # Check if we are at setup wizard first (just in case)
        if page.get_by_text("Setup Your Business").is_visible():
            print("At Setup Wizard - this is unexpected if mock data is present.")
            # Can't easily proceed without valid data
            return

        # Login Flow
        print("Attempting Login...")

        # Wait for select element (using class or name if available, otherwise role)
        # The login screen usually has a select for user and input for PIN
        page.wait_for_selector("select")

        # Select the first option (usually Admin)
        # We need to know the value or label. Assuming "Admin" or similar from users.json
        # Let's try to select by index or just type if it's not a select (but prompt says dropdown)

        # Let's list options to be sure or just select the second one (first is often placeholder)
        page.locator("select").select_option(index=1)

        # Enter PIN
        page.fill("input[type='password']", "1234") # Default PIN

        # Click Login
        page.get_by_role("button", name="Login").click()

        # Wait for Dashboard
        expect(page.get_by_text("Point of Sale")).to_be_visible(timeout=10000)
        print("Login Successful")

        # Navigate to Manage Page
        # Usually a gear icon or "Settings" in sidebar
        # Let's look for "Manage" or "Settings" link
        page.get_by_role("link", name="Settings").click()
        # Or maybe it's "Manage"
        # If link name is different, we might fail here.
        # Let's try finding by icon or href if needed.

        # Wait for Manage Page
        expect(page.get_by_text("Manage Settings")).to_be_visible()

        # Verify API Key Section
        print("Verifying API Key Section...")
        expect(page.get_by_text("Mobile & Back Office Connection")).to_be_visible()

        # Check if API key input exists
        api_key_input = page.locator("input[readonly]")
        expect(api_key_input).to_be_visible()

        # If empty (placeholder), click Generate
        val = api_key_input.input_value()
        if "No API Key" in val:
            print("Generating new key...")
            page.get_by_title("Generate New Key").click()
            page.wait_for_timeout(1000) # Wait for state update

        # Verify QR Code
        expect(page.locator("img[alt='API Key QR Code']")).to_be_visible()

        # Take Screenshot
        page.screenshot(path="/home/jules/verification/manage_page_verification.png")
        print("Verification Screenshot Taken")

    except Exception as e:
        print(f"Verification Failed: {e}")
        page.screenshot(path="/home/jules/verification/failure.png")
        raise e

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_manage_page(page)
        finally:
            browser.close()
