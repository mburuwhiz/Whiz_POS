from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_manage_page(page: Page):
    # 1. Arrange: Go to the App
    print("Navigating to app...")
    page.goto("http://localhost:5174")

    # Wait for loading to complete
    try:
        print("Waiting for loading screen to disappear...")
        page.wait_for_selector("text=Loading...", state="detached", timeout=10000)
    except:
        print("Loading screen not found or timeout.")

    # Handle potential redirect to Setup or Login
    if page.is_visible("text=Business Setup"):
        print("Redirected to Business Setup. Cannot verify Manage Page without completing setup.")
        # Attempt to fill setup if we are in a clean state, or just skip
        # For now, we just report it.
        # To properly test, we might need to mock the store or data.
        return

    # 2. Navigate to Manage Page
    # Try direct URL first as it's faster and more reliable if routing works
    print("Navigating to Manage page directly...")
    page.goto("http://localhost:5174/#/manage") # Assuming hash router or history API

    # Fallback: Look for navigation button if direct nav fails or redirects
    if not page.is_visible("text=Manage Settings"):
        print("Direct navigation failed or redirected. Trying sidebar click...")
        # Try clicking "Settings" or "Manage" in sidebar
        # Note: In the provided sidebar code (back-office), it was "Settings".
        # In Desktop App (App.tsx/Sidebar.tsx), we need to know the label.
        # Assuming "Manage" based on context.
        try:
             page.get_by_role("link", name="Manage").click()
        except:
             print("Could not find Manage link.")

    time.sleep(2)

    # Check if we are on Manage Page
    if not page.is_visible("text=Manage Settings"):
         print("Failed to reach Manage Page.")
         page.screenshot(path="/home/jules/verification/failed_nav.png")
         return

    print("On Manage Page.")

    # 3. Act: Click on "Devices & Connections" tab
    print("Clicking Devices & Connections tab...")
    try:
        page.click("text=Devices & Connections", timeout=5000)
    except:
        print("Could not click Devices & Connections tab.")
        page.screenshot(path="/home/jules/verification/failed_click.png")
        return

    # 4. Assert: Check for elements
    print("Verifying elements...")
    expect(page.get_by_text("Mobile App Connection")).to_be_visible()
    expect(page.get_by_text("Back Office Connection")).to_be_visible()

    # Check for QR Code
    expect(page.locator("img[alt='Connection QR Code']")).to_be_visible()

    # 5. Screenshot
    page.screenshot(path="/home/jules/verification/manage_devices_verification.png")
    print("Manage Devices page screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_manage_page(page)
        except Exception as e:
            print(f"Verification failed: {e}")
        finally:
            browser.close()
