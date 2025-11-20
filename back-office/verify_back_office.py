from playwright.sync_api import Page, expect, sync_playwright

def verify_back_office(page: Page):
    # 1. Arrange: Go to the Dashboard
    page.goto("http://localhost:5000")

    # 2. Assert: Check title
    expect(page).to_have_title("WHIZ POS | Dashboard")

    # 3. Assert: Check Sidebar existence
    expect(page.locator("text=Back Office")).to_be_visible()

    # 4. Screenshot
    page.screenshot(path="/home/jules/verification/dashboard_verification.png")
    print("Dashboard screenshot taken.")

    # 5. Navigate to Sales
    page.click("text=Sales")
    expect(page).to_have_title("WHIZ POS | Sales")
    page.screenshot(path="/home/jules/verification/sales_verification.png")
    print("Sales page screenshot taken.")

    # 6. Navigate to Inventory
    page.click("text=Inventory")
    expect(page).to_have_title("WHIZ POS | Inventory")
    page.screenshot(path="/home/jules/verification/inventory_verification.png")
    print("Inventory page screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_back_office(page)
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
