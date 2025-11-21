
import time
from playwright.sync_api import sync_playwright

def verify_back_office_settings():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to Back Office Login...")
            page.goto("http://localhost:5000/login")
            page.wait_for_timeout(2000)

            if "login" in page.url:
                print("Logging in with admin/admin123...")
                # Using placeholders since labels might not match perfectly or are hidden
                page.get_by_placeholder("Enter your ID").fill("admin")
                page.get_by_placeholder("Enter your password").fill("admin123")
                page.get_by_role("button", name="Sign In").click()
                page.wait_for_timeout(2000)

            print(f"Current URL: {page.url}")

            # Navigate to settings
            print("Navigating to Settings...")
            page.goto("http://localhost:5000/settings")
            page.wait_for_timeout(2000)

            # Take screenshot of Settings Page
            page.screenshot(path="verification/back_office_settings.png", full_page=True)
            print("Screenshot saved to verification/back_office_settings.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_back_office_settings()
