
from playwright.sync_api import sync_playwright
import time

def verify_clear_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            # Navigate to app (using port 5174 as discovered earlier, or check logs)
            page.goto("http://localhost:5174")

            # Wait for loading
            page.wait_for_timeout(3000)

            # 1. Login
            if page.is_visible("text=Admin"):
                page.click("text=Admin")
                page.wait_for_timeout(500)

                page.click("button:has-text(\"1\")")
                page.click("button:has-text(\"2\")")
                page.click("button:has-text(\"3\")")
                page.click("button:has-text(\"4\")")
                page.click("text=Access POS")
                page.wait_for_timeout(3000)

            # 2. Verify Product Grid Search
            # Type into search
            page.fill("input[placeholder=\"Search for products...\"]", "Coffee")
            page.wait_for_timeout(500)

            # Verify Clear Button is visible
            # It should be a button with X icon inside the relative container
            # We can select it by being adjacent to the input or inside the div
            # The input and button are siblings in a div
            # Or assume it is the only button in that div

            # Check visibility
            page.screenshot(path="verification/1_search_filled.png")

            # Click Clear Button
            # The button has the X icon. It is positioned absolute right.
            # We can target the button directly.
            # We can use css selector for the button in the relative div
            # The relative div contains the input with placeholder "Search for products..."

            page.click("div:has(input[placeholder=\"Search for products...\"]) button")

            page.wait_for_timeout(500)

            # Verify input is empty
            input_val = page.input_value("input[placeholder=\"Search for products...\"]")
            if input_val == "":
                print("Search cleared successfully")
            else:
                print(f"Search NOT cleared. Value: {input_val}")

            page.screenshot(path="verification/2_search_cleared.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_clear_button()
