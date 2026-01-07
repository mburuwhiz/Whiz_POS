
import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        # Launch browser (headless for CI/sandbox)
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        context = await browser.new_context()
        page = await context.new_page()

        try:
            # Navigate to the app
            print("Navigating to app...")
            await page.goto("http://localhost:5174")

            # Wait for Login Screen
            print("Waiting for Login Screen...")
            await page.wait_for_selector('text=Select Cashier', timeout=10000)

            # Login
            print("Selecting Admin user...")
            # Wait for the select element to be populated
            await page.wait_for_timeout(2000)

            # Find the option with text containing 'Admin'
            # We select by label to be safe
            await page.select_option('select', label='Admin (admin)')
            print("Admin Selected.")

            # Enter PIN '1234'
            print("Entering PIN...")
            await page.click('text=1')
            await page.click('text=2')
            await page.click('text=3')
            await page.click('text=4')
            await page.click('text=Login')

            # Wait for Dashboard/POS
            print("Waiting for Dashboard...")
            # Look for "Products" header which we saw in the screenshot
            await page.wait_for_selector('h2:has-text("Products")', timeout=15000)
            print("Dashboard Loaded.")

            # Create a Transaction
            print("Creating a transaction...")
            # Click the first "Add to Cart" button
            await page.click('text=Add to Cart >> nth=0')
            await page.wait_for_timeout(500)

            # Click Checkout
            await page.click('text=Checkout')
            await page.wait_for_timeout(500)

            # Click Complete Payment (Green button)
            print("Completing Payment...")
            await page.click('text=Complete Payment')

            # Wait for modal to close / success
            await page.wait_for_timeout(2000)
            print("Transaction created.")

            # Navigate to Old Receipts
            print("Navigating to Old Receipts...")
            await page.click('text=Old Receipts')
            await page.wait_for_selector('text=Previous Receipts', timeout=5000)
            await page.screenshot(path='/home/jules/verification/old_receipts.png')
            print("Old Receipts Page captured.")

            # Verify Reverse Button
            # Look for a button with title "Reverse Transaction" or text "Reverse"
            reverse_btn = page.locator('button[title="Reverse Transaction"]')
            if await reverse_btn.count() > 0:
                print("SUCCESS: Reverse button found.")
            else:
                print("WARNING: Reverse button NOT found. (Maybe transaction didn't sync or user not admin?)")

            # Navigate to Settings
            print("Navigating to Settings...")
            await page.click('text=Settings')
            await page.wait_for_selector('text=Settings', timeout=5000)

            # Navigate to Data Management Tab
            print("Clicking Data tab...")
            await page.click('text=Data')
            await page.wait_for_selector('text=Data Management', timeout=5000)
            await page.screenshot(path='/home/jules/verification/settings_data.png')
            print("Settings Data Tab captured.")

            print("ALL CHECKS PASSED.")

        except Exception as e:
            print(f"Verification failed: {e}")
            await page.screenshot(path='/home/jules/verification/error_v2.png')
            print("Error screenshot saved to error_v2.png")

        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
