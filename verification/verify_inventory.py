from playwright.sync_api import sync_playwright, expect
import time

def verify_inventory(page):
    print("Navigating to Back Office...")
    page.goto("http://localhost:5000")

    # Login
    print("Logging in...")
    page.fill("input[name='username']", "admin")
    page.fill("input[name='password']", "admin123")
    page.click("button[type='submit']")
    expect(page).to_have_url("http://localhost:5000/")

    # --- Inventory CRUD ---
    print("Testing Inventory Add...")
    page.goto("http://localhost:5000/inventory")

    page.get_by_role("button", name="Add Product").click()
    page.fill("input[name='name']", "Debug Product")
    page.fill("input[name='price']", "100")
    page.fill("input[name='stock']", "50")
    page.fill("input[name='category']", "Debug")

    page.click("button:has-text('Save Product')")

    # Check for error text on page
    if page.get_by_text("Error adding product").count() > 0:
        print("Error found on page")
        page.screenshot(path="verification/debug_inventory.png")
    else:
        expect(page.get_by_text("Debug Product")).to_be_visible()
        print("Inventory Add Verified.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_inventory(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/debug_inventory.png")
        finally:
            browser.close()
