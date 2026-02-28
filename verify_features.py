
import asyncio
from playwright.async_api import async_playwright
import datetime

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        context = await browser.new_context()
        page = await context.new_page()

        try:
            print("Navigating to app...")
            await page.goto("http://localhost:5174")

            # Helper to login
            async def login():
                print("Logging in...")
                await page.wait_for_selector('text=Select Cashier', timeout=10000)
                await page.wait_for_timeout(2000)
                await page.select_option('select', label='Admin (admin)')
                await page.click('text=1')
                await page.click('text=2')
                await page.click('text=3')
                await page.click('text=4')
                await page.click('text=Login')

            await login()

            # --- Verify Delete Receipts ---
            print("Navigating to Old Receipts...")
            await page.wait_for_selector('text=Old Receipts', timeout=10000)
            await page.click('text=Old Receipts')
            await page.wait_for_selector('text=Previous Receipts', timeout=5000)

            print("Opening Delete Receipts Modal...")
            # Button should be visible for Admin
            await page.click('button:has-text("Delete Receipts")')
            await page.wait_for_selector('h3:has-text("Delete Old Receipts")', timeout=5000)

            # Fill dates
            today = datetime.date.today().strftime('%Y-%m-%d')
            yesterday = (datetime.date.today() - datetime.timedelta(days=1)).strftime('%Y-%m-%d')

            await page.fill('input[type="date"] >> nth=0', yesterday) # Start
            await page.fill('input[type="date"] >> nth=1', yesterday) # End

            # Click Find
            await page.click('button:has-text("Find Receipts to Delete")')

            # Take screenshot of confirmation state
            await page.wait_for_timeout(500)
            await page.screenshot(path='/home/jules/verification/delete_receipts_modal.png')
            print("Captured delete_receipts_modal.png")

            # --- Verify Closing Report ---
            print("Reloading to clear state...")
            await page.reload()
            await login() # Re-login required due to store settings

            print("Creating a test sale to populate report...")
            # Wait for dashboard/POS
            await page.wait_for_selector('text=POS', timeout=15000)

            # Ensure we are on POS (default after login usually, but click to be safe)
            if not await page.locator('text=Products').is_visible():
                 await page.click('text=POS')

            await page.wait_for_selector('text=Products', timeout=5000)
             # Click first product (Add to Cart)
            await page.click('button:has-text("Add to Cart") >> nth=0')
            await page.click('text=Checkout')
            await page.click('text=Complete Payment')
            await page.wait_for_timeout(2000) # Wait for complete

            print("Sale completed. Navigating to Closing Report...")
            await page.click('text=Closing')
            await page.wait_for_selector('text=Closing Report', timeout=5000)
            await page.wait_for_timeout(2000)

            # Scroll to see details
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

            await page.screenshot(path='/home/jules/verification/closing_report_preview.png')
            print("Captured closing_report_preview.png")

            print("VERIFICATION SUCCESS")

        except Exception as e:
            print(f"Verification Failed: {e}")
            await page.screenshot(path='/home/jules/verification/features_error_v3.png')
            print("Saved features_error_v3.png")

        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
