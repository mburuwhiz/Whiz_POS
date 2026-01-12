
from playwright.sync_api import sync_playwright
import time

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to ensure sidebar is definitely visible initially
        context = browser.new_context(viewport={"width": 1400, "height": 900})
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:5174")
            page.wait_for_load_state("networkidle")

            # Login if needed
            if page.is_visible("text=Admin"):
                print("Logging in...")
                page.click("text=Admin")
                page.click("button:has-text(\"1\")")
                page.click("button:has-text(\"2\")")
                page.click("button:has-text(\"3\")")
                page.click("button:has-text(\"4\")")
                page.click("text=Access POS")
                page.wait_for_selector("text=Current Order", state="visible")
                print("Logged in.")

            # --- Test Sidebar Toggle ---
            print("\n[Check] Sidebar Toggle...")
            # Sidebar should be visible initially (assuming default false in store)
            # Navigation component has "Point of Sale" text
            if page.is_visible("text=Point of Sale"):
                print("Sidebar is visible.")
            else:
                print("Sidebar is NOT visible initially.")

            # Click toggle button (Menu icon)
            # The button in Header has title="Toggle Menu"
            print("Clicking Toggle Menu...")
            page.click("button[title=\"Toggle Menu\"]")
            page.wait_for_timeout(500)

            if not page.is_visible("text=Point of Sale"):
                print("PASS: Sidebar collapsed.")
            else:
                print("FAIL: Sidebar did not collapse.")

            # Click again to show it for navigation
            page.click("button[title=\"Toggle Menu\"]")
            page.wait_for_timeout(500)
            if page.is_visible("text=Point of Sale"):
                print("PASS: Sidebar restored.")
            else:
                print("FAIL: Sidebar did not restore.")

            # --- Test 1: Product Grid Clear ---
            print("\n[1/5] Testing Product Grid Clear...")
            # Ensure we are on POS page
            if not page.url.endswith("/"):
                page.click("a[href=\"/\"]", force=True)

            search_box = page.locator("input[placeholder=\"Search for products...\"]")
            search_box.wait_for(state="visible")
            search_box.fill("Coffee")

            clear_btn = page.locator("div.relative:has(> input[placeholder=\"Search for products...\"]) > button")

            if clear_btn.is_visible():
                clear_btn.click()
                page.wait_for_timeout(200)
                if search_box.input_value() == "":
                    print("PASS: Product Grid cleared.")
                else:
                    print(f"FAIL: Product Grid not cleared. Value: '{search_box.input_value()}'")
            else:
                print("FAIL: Product Grid clear button not visible.")

            # --- Test 2: Credits Page Clear ---
            print("\n[2/5] Testing Credits Page Clear...")
            page.click("a[href=\"/customers\"]", force=True)
            page.wait_for_url("**/customers")

            credit_search = page.locator("input[placeholder*=\"Search customers\"]")
            credit_search.wait_for(state="visible")
            credit_search.fill("John")

            credit_clear = page.locator("div.relative:has(> input[placeholder*=\"Search customers\"]) > button")

            if credit_clear.is_visible():
                credit_clear.click()
                page.wait_for_timeout(200)
                if credit_search.input_value() == "":
                    print("PASS: Credits Page cleared.")
                else:
                    print(f"FAIL: Credits Page not cleared. Value: '{credit_search.input_value()}'")
            else:
                print("FAIL: Credits Page clear button not visible.")

            # --- Test 3: Inventory Page Clear ---
            print("\n[3/5] Testing Inventory Page Clear...")
            page.click("a[href=\"/inventory\"]", force=True)
            page.wait_for_url("**/inventory")

            inv_search = page.locator("input[placeholder*=\"Search products\"]")
            inv_search.wait_for(state="visible")
            inv_search.fill("Milk")

            inv_clear = page.locator("div.relative:has(> input[placeholder*=\"Search products\"]) > button")

            if inv_clear.is_visible():
                inv_clear.click()
                page.wait_for_timeout(200)
                if inv_search.input_value() == "":
                    print("PASS: Inventory Page cleared.")
                else:
                    print(f"FAIL: Inventory Page not cleared. Value: '{inv_search.input_value()}'")
            else:
                print("FAIL: Inventory Page clear button not visible.")

            # --- Test 4: Expenses Page Clear ---
            print("\n[4/5] Testing Expenses Page Clear...")
            page.click("a[href=\"/expenses\"]", force=True)
            page.wait_for_url("**/expenses")

            exp_search = page.locator("input[placeholder*=\"Search expenses\"]")
            exp_search.wait_for(state="visible")
            exp_search.fill("Rent")

            exp_clear = page.locator("div.relative:has(> input[placeholder*=\"Search expenses\"]) > button")

            if exp_clear.is_visible():
                exp_clear.click()
                page.wait_for_timeout(200)
                if exp_search.input_value() == "":
                    print("PASS: Expenses Page cleared.")
                else:
                    print(f"FAIL: Expenses Page not cleared. Value: '{exp_search.input_value()}'")
            else:
                print("FAIL: Expenses Page clear button not visible.")

            # --- Test 5: Old Receipts Page Clear ---
            print("\n[5/5] Testing Old Receipts Page Clear...")
            page.click("a[href=\"/previous-receipts\"]", force=True)
            page.wait_for_url("**/previous-receipts")

            old_search = page.locator("input[placeholder*=\"Search receipts\"]")
            old_search.wait_for(state="visible")
            old_search.fill("REC")

            old_clear = page.locator("div.relative:has(> input[placeholder*=\"Search receipts\"]) > button")

            if old_clear.is_visible():
                old_clear.click()
                page.wait_for_timeout(200)
                if old_search.input_value() == "":
                    print("PASS: Old Receipts Page cleared.")
                else:
                    print(f"FAIL: Old Receipts Page not cleared. Value: '{old_search.input_value()}'")
            else:
                print("FAIL: Old Receipts Page clear button not visible.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_full_v3.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
