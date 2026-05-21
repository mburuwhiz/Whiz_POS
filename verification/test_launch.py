from playwright.sync_api import sync_playwright
import time

def verify():
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("http://localhost:5173")
            time.sleep(5)
            page.screenshot(path="/home/jules/verification/verification.png")
            print("Screenshot taken")
            browser.close()
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    verify()
