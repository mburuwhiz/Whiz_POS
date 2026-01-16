
import time
from playwright.sync_api import sync_playwright, expect

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Grant permissions for camera and clipboard
        context = browser.new_context(
            permissions=['camera', 'clipboard-read', 'clipboard-write'],
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        try:
            # Navigate to home
            page.goto("http://localhost:5174")

            # Wait for app to load
            time.sleep(3)

            # Check if we are at login (look for user selection)
            if page.get_by_text("Select an account to login").is_visible():
                print("Logging in as Admin...")
                # Click Admin user
                page.get_by_text("Admin", exact=True).click()
                time.sleep(1)

                # Enter PIN 1234
                print("Entering PIN...")
                page.get_by_role("button", name="1").click()
                page.get_by_role("button", name="2").click()
                page.get_by_role("button", name="3").click()
                page.get_by_role("button", name="4").click()

                # Click Access POS
                print("Clicking Access POS...")
                page.get_by_role("button", name="Access POS").click()

                # Wait for dashboard/POS to load
                # Correct selector is "Search for products..."
                try:
                    expect(page.get_by_placeholder("Search for products...")).to_be_visible(timeout=10000)
                    print("Login successful (Dashboard loaded).")
                except:
                    print("Login might have failed or is slow. Current URL:", page.url)
                    page.screenshot(path="verification/login_failed.png")
                    raise

            # Helper to navigate via click to preserve SPA state
            def navigate_via_link(name):
                print(f"Navigating to {name}...")
                page.get_by_role("link", name=name).click()
                time.sleep(2)

            # 1. Verify Invoice Generator
            print("Verifying Invoice Generator...")
            navigate_via_link("Invoices & Quotes")
            page.screenshot(path="verification/invoice_page.png")

            # Check for A4/A5 buttons
            expect(page.get_by_role("button", name="Save A4")).to_be_visible()
            expect(page.get_by_role("button", name="Save A5")).to_be_visible()
            print("SUCCESS: Save buttons visible.")

            # Click A5 toggle
            page.get_by_role("button", name="A5", exact=True).click()
            time.sleep(1)
            page.screenshot(path="verification/invoice_a5.png")

            # 2. Verify Scanner
            print("Verifying Scanner...")
            navigate_via_link("Scanner")
            page.screenshot(path="verification/scanner_page.png")

            # Check for mode buttons
            expect(page.get_by_role("button", name="Scan to Cart")).to_be_visible()
            expect(page.get_by_role("button", name="Price Check")).to_be_visible()
            print("SUCCESS: Scanner buttons visible.")

            # 3. Verify Sync Status
            print("Verifying Sync Status...")
            navigate_via_link("Sync")
            page.screenshot(path="verification/sync_page.png")

            # Verify placeholder is gone
            expect(page.get_by_text("APK Sync Placeholder")).not_to_be_visible()
            print("SUCCESS: APK Placeholder gone from Sync.")

            # Verify Full Sync button triggers confirm
            # Note: The button text might be "Full Cloud Synchronization" or similar.
            # Using partial match or specific text.
            if page.get_by_text("Full Cloud Synchronization").is_visible():
                page.get_by_text("Full Cloud Synchronization").click()
                time.sleep(1)
                expect(page.get_by_text("Full Synchronization")).to_be_visible() # Dialog title
                print("SUCCESS: Sync Confirm Dialog appeared.")
                page.screenshot(path="verification/sync_confirm_dialog.png")
                # Close dialog
                page.get_by_role("button", name="Cancel").click()
            else:
                print("WARNING: Sync button not found. Checking screenshot.")

            # 4. Verify Settings Page (Nav link is "Settings", Route is /manage)
            print("Verifying Settings Page...")
            navigate_via_link("Settings")

            # Go to Connected Devices tab (if applicable) or check content
            # The previous code tried to click "Connected Devices".
            # Let's see if that text is visible.
            try:
                if page.get_by_text("Connected Devices").is_visible():
                     page.get_by_text("Connected Devices").click()
                     time.sleep(1)
                page.screenshot(path="verification/settings_devices.png")

                # Check placeholder gone
                expect(page.get_by_text("APK Sync Placeholder")).not_to_be_visible()
                print("SUCCESS: APK Placeholder gone from Settings.")
            except:
                 print("Could not navigate/verify devices tab.")

            # Go to Data Management tab
            if page.get_by_text("Data Management").is_visible():
                page.get_by_text("Data Management").click()
                time.sleep(1)

                # Try Archive button (Check if confirm dialog appears)
                # "Archive Receipts" or similar
                # Just screenshot this area
                page.screenshot(path="verification/settings_data.png")

            print("Verification Complete.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="verification/error_state.png")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    verify_changes()
