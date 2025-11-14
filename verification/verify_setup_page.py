from playwright.sync_api import Page, expect, sync_playwright

def verify_business_setup_page(page: Page):
    """
    This script verifies that the business setup page is displayed on first load.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:5174/")

    # 2. Assert: Verify that the business setup page is displayed.
    expect(page.get_by_text("Business Registration")).to_be_visible(timeout=20000)
    expect(page.get_by_placeholder("Enter Business Name")).to_be_visible()

    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="/app/verification/business_setup_page.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_business_setup_page(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="/app/verification/error_screenshot.png")
        finally:
            browser.close()
