from playwright.sync_api import sync_playwright
import time

def verify_mobile_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate to the served mobile app
            page.goto("http://localhost:8081")

            # Wait for the Connect Screen to load (looking for "Connect to Desktop")
            page.wait_for_selector("text=Connect to Desktop", timeout=10000)

            # Take screenshot of Connect Screen
            page.screenshot(path="verification/mobile_connect.png")
            print("Screenshot captured: verification/mobile_connect.png")

            # Simulate Connection (fill mock data)
            # Note: We can't easily mock the full Desktop API response here without running the full electron app,
            # which is hard in this environment. So we primarily verify the UI renders.
            # However, we can verify that the inputs exist.
            page.fill("input[placeholder*='192.168']", "http://localhost:3000")
            page.fill("input[placeholder*='Enter API Key']", "test-key")

            page.screenshot(path="verification/mobile_connect_filled.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            # Take screenshot even on failure to see what happened
            try:
                page.screenshot(path="verification/mobile_error.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    verify_mobile_app()
