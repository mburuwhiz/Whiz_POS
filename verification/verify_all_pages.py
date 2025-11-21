from playwright.sync_api import sync_playwright, expect
import time

def verify_pages(page):
    print("Navigating to Back Office...")
    page.goto("http://localhost:5000")

    # Login
    print("Logging in...")
    page.fill("input[name='username']", "admin")
    page.fill("input[name='password']", "admin123")
    page.click("button[type='submit']")
    expect(page).to_have_url("http://localhost:5000/")

    # Pages to verify
    pages = [
        ("Sales", "http://localhost:5000/sales"),
        ("Inventory", "http://localhost:5000/inventory"),
        ("Expense", "http://localhost:5000/expenses"), # Matches "Expense Tracking"
        ("Credit", "http://localhost:5000/credit"), # Matches "Credit Management"
        ("User", "http://localhost:5000/users") # Matches "User Management"
    ]

    for name, url in pages:
        print(f"Verifying {name} page...")
        page.goto(url)
        # Use partial match for headings to handle "Sales & Transactions" vs "Sales"
        # and filter by visibility to avoid hidden elements issues
        expect(page.locator("h2", has_text=name).first).to_be_visible()
        # Check for basic table presence (indicates view rendered)
        # Inventory uses grid, not table.
        if name == "Inventory":
            # Check for grid or "No products" message
            if page.locator(".grid").count() > 0:
                 expect(page.locator(".grid").first).to_be_visible()
            else:
                 expect(page.get_by_text("No products found")).to_be_visible()
        else:
            expect(page.locator("table")).to_be_visible()
        print(f"{name} page verified.")

    print("Taking screenshot of Inventory...")
    page.goto("http://localhost:5000/inventory")
    page.screenshot(path="verification/backoffice_inventory.png")
    print("All pages verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_pages(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure_pages.png")
        finally:
            browser.close()
