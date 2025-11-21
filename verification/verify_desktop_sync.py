from playwright.sync_api import sync_playwright
import os
import time

def verify_desktop_sync():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Navigate to App
        print("Navigating to App on port 5174...")
        try:
            page.goto("http://localhost:5174", timeout=60000)
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # 2. Handle Login if needed
        print("Checking for Login Screen...")
        try:
            # Wait a bit for app to load and decide route
            page.wait_for_timeout(2000)

            if page.get_by_text("Select Cashier").is_visible():
                print("Login Screen detected. Logging in...")

                # Wait for select to be present
                page.wait_for_selector("select")

                # Get value of the first option that is not empty (not "Select a user")
                # Options might not be visible, so we don't wait for visibility
                options = page.locator("select option").all()
                user_id = None
                for opt in options:
                    val = opt.get_attribute("value")
                    if val and val != "":
                        user_id = val
                        break

                if user_id:
                    print(f"Selecting user with ID: {user_id}")
                    page.select_option("select", user_id)
                else:
                    print("No user found in select!")

                # Enter PIN (1234 is common mock default)
                print("Entering PIN...")
                page.click("text=1")
                page.click("text=2")
                page.click("text=3")
                page.click("text=4")

                page.click("button:has-text('Login')")

                # Wait for dashboard/main page
                page.wait_for_url("**/", timeout=5000)
                print("Logged in.")
        except Exception as e:
            print(f"Login handling error (might be already logged in or no users): {e}")

        # 3. Navigate to Status Page
        print("Navigating to /status...")
        page.goto("http://localhost:5174/status")

        # 4. Wait for content
        print("Waiting for page content...")
        try:
            page.wait_for_selector("text=Sync Status", timeout=10000)
        except:
            print("Sync Status header not found. Taking debug screenshot.")
            page.screenshot(path="verification/debug_sync_fail_4.png")
            raise

        # 5. Verify New Elements
        print("Verifying Manual Sync Buttons...")
        page.wait_for_selector("text=Push Pending Data")
        page.wait_for_selector("text=Pull Updates")
        page.wait_for_selector("text=Full Cloud Synchronization")

        print("Verifying Mobile Placeholder...")
        page.wait_for_selector("text=Mobile App (APK) Sync")
        page.wait_for_selector("text=APK Sync Placeholder")

        # 6. Take Screenshot
        print("Taking screenshot...")
        os.makedirs("verification", exist_ok=True)
        page.screenshot(path="verification/desktop_sync_page.png", full_page=True)

        browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    verify_desktop_sync()
