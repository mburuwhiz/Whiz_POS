from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_credit_customer_page(page: Page):
    """
    This script verifies the credit customer page UI and functionality.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5183/")

    # Wait for the page to load and check for the login screen
    expect(page.get_by_text("Login")).to_be_visible(timeout=20000)

    # 2. Act: Log in to the application
    # Click the user dropdown
    page.locator('button[role="combobox"]').click()
    # Select the cashier
    page.get_by_text("Josphat Mburu").click()
    # Enter the PIN
    pin_digits = "1234"
    for digit in pin_digits:
        page.get_by_role("button", name=digit).click()
    # Click Login
    page.get_by_role("button", name="Login").click()

    # 3. Act: Navigate to the Credit Customers page
    # Wait for the main page to load
    expect(page.get_by_text("Main Menu")).to_be_visible(timeout=10000)
    # Click on the "Credit Customers" link
    page.get_by_role("link", name="Credit Customers").click()

    # 4. Assert: Verify the page content
    expect(page.get_by_text("Credit Sales Information")).to_be_visible(timeout=10000)

    # 5. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="/app/verification/credit_customer_page.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_credit_customer_page(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="/app/verification/error_screenshot.png")
        finally:
            browser.close()
