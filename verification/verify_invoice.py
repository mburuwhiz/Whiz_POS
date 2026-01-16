import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate
        print("Navigating to root...")
        page.goto("http://localhost:5174/", timeout=60000)

        # Handle Login if present
        try:
            # Wait a bit
            time.sleep(2)

            if page.is_visible("text=Welcome"):
                print("Login Screen detected. Logging in...")
                page.click("text=Admin")
                time.sleep(0.5)
                page.click("button:has-text('1')")
                page.click("button:has-text('2')")
                page.click("button:has-text('3')")
                page.click("button:has-text('4')")
                time.sleep(0.5)
                page.click("text=Access POS")
                page.wait_for_selector("text=POS", timeout=10000)
                print("Login successful.")
        except Exception as e:
            print(f"Login exception: {e}")

        # Now go to invoices with HASH
        print("Navigating to #/invoices...")
        page.goto("http://localhost:5174/#/invoices")

        # Wait for Document Editor
        try:
            page.wait_for_selector("text=Document Editor", timeout=20000)
        except:
             page.screenshot(path="verification/failed_hash.png", full_page=True)
             raise

        # Interact
        page.fill("input[placeholder='Client Name / Contact Person']", "Whizpoint Client")
        page.fill("input[placeholder='Company Name']", "Verification Corp")

        page.click("text=Add Item")

        time.sleep(2)

        page.screenshot(path="verification/invoice_final.png", full_page=True)
        print("Success!")

        browser.close()

if __name__ == "__main__":
    run()
