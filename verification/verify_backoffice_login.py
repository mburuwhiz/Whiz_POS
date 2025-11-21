from playwright.sync_api import sync_playwright, expect
import time

def verify_backoffice(page):
    print("Navigating to Back Office...")
    page.goto("http://localhost:5000")

    print("Verifying redirect to login...")
    expect(page).to_have_url("http://localhost:5000/login")

    print("Logging in...")
    page.fill("input[name='username']", "admin")
    page.fill("input[name='password']", "admin123")
    page.click("button[type='submit']")

    print("Verifying dashboard access...")
    expect(page).to_have_url("http://localhost:5000/")
    # Expect the dashboard heading to be visible
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()

    # Wait for Lucide icons to render/load
    time.sleep(1)

    print("Taking screenshot...")
    page.screenshot(path="verification/backoffice_dashboard.png")
    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_backoffice(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()
