
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--no-sandbox', '--disable-setuid-sandbox'])
        context = await browser.new_context()
        page = await context.new_page()

        try:
            print("Navigating to app...")
            await page.goto("http://localhost:5174")

            # Login Flow
            print("Logging in...")
            await page.wait_for_selector('text=Select Cashier', timeout=10000)
            await page.wait_for_timeout(2000) # Wait for options
            await page.select_option('select', label='Admin (admin)')
            await page.click('text=1')
            await page.click('text=2')
            await page.click('text=3')
            await page.click('text=4')
            await page.click('text=Login')

            # Go to Expenses
            print("Navigating to Expenses...")
            await page.wait_for_selector('text=Expenses', timeout=15000)
            await page.click('text=Expenses')
            await page.wait_for_selector('text=Expense Tracker', timeout=5000)

            # Check if "Test Supplier" row exists
            print("Checking for existing Test Supplier...")
            supplier_row = page.locator('div.font-medium:has-text("Test Supplier")').first

            if not await supplier_row.is_visible():
                print("Test Supplier not found. Need to create it.")

                # Check if Generic Add Modal is already open
                # We check for the description input
                desc_input = page.locator('input[placeholder="Enter expense description"]')

                if not await desc_input.is_visible():
                    print("Generic Modal not open. Clicking Header Add Button...")
                    # Use specific selector for Header button (has Plus icon)
                    await page.click('button:has(.lucide-plus)')
                    await desc_input.wait_for(state="visible", timeout=2000)
                else:
                    print("Generic Modal was already open.")

                # Fill Form
                print("Filling Add Expense Form...")
                await desc_input.fill('Test Supplier')
                await page.fill('input[placeholder="0.00"]', '500')

                # Click Submit (Inside Modal)
                # The modal container is fixed inset-0.
                print("Submitting Form...")
                submit_btn = page.locator('div.fixed button:has-text("Add Expense")')
                await submit_btn.click()

                # Wait for modal to close (or check if it closed)
                await page.wait_for_timeout(1000)
                print("Expense Added.")
            else:
                print("Test Supplier already exists.")

            # Now verify the NEW Feature: Click row -> Open History Modal
            print("Testing History Modal trigger...")
            # Re-locate row
            await page.click('div.font-medium:has-text("Test Supplier")')

            # Verify History Modal
            # Look for "Total Expenses" (unique to History Modal)
            print("Waiting for History Modal...")
            await page.wait_for_selector('text=Total Expenses', timeout=5000)
            await page.wait_for_selector('h2:has-text("Test Supplier")', timeout=5000)

            await page.screenshot(path='/home/jules/verification/expense_history_modal_success.png')
            print("SUCCESS: Captured expense_history_modal_success.png")

            # Verify adding from within History Modal
            print("Testing Add from History...")
            await page.click('button:has-text("+ Add Expense")') # Green button

            # Verify internal form appears
            await page.wait_for_selector('h3:has-text("Add New Expense")', timeout=2000)

            await page.screenshot(path='/home/jules/verification/expense_history_internal_add.png')
            print("SUCCESS: Captured expense_history_internal_add.png")

        except Exception as e:
            print(f"Verification Failed: {e}")
            await page.screenshot(path='/home/jules/verification/expense_error_final_v2.png')
            print("Saved expense_error_final_v2.png")

        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
