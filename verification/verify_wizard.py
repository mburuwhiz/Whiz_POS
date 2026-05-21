from playwright.sync_api import sync_playwright
import time

def verify_setup_wizard(page):
    # Navigate to the app
    page.goto("http://localhost:5174/")

    # Wait for either the Welcome screen or the Changelog
    page.wait_for_load_state("networkidle")

    # If Changelog is visible, click Let's Explore
    if page.locator("text=Major Yearly Update!").is_visible():
        page.get_by_role("button", name="Let's Explore").click()

    # Wait for the setup wizard to load
    page.wait_for_selector("text=Welcome to Whiz POS")
    page.screenshot(path="verification/01_welcome.png")

    # Click Begin Setup
    page.get_by_role("button", name="Begin Setup").click()
    page.wait_for_selector("text=Network Architecture")
    page.screenshot(path="verification/02_mode_selection.png")

    # Choose Outlet to see the new connection screen
    page.get_by_text("Checkout Outlet").click()
    page.wait_for_selector("text=Connect to Server")
    page.screenshot(path="verification/03_outlet_connect.png")

    # Enter some details and try to connect
    page.get_by_placeholder("e.g. Counter 1, VIP Lounge").fill("Test Terminal")
    page.get_by_placeholder("Or enter manually").fill("http://localhost:3000")

    # Take screenshot of the form
    page.screenshot(path="verification/04_outlet_form.png")

    # Click Connect
    page.get_by_role("button", name="Connect Terminal").click()

    # Wait for pending state
    page.wait_for_selector("text=Pending Server Approval")
    page.screenshot(path="verification/05_pending_approval.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_setup_wizard(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png")
        finally:
            browser.close()
