
import time
from playwright.sync_api import sync_playwright

def verify_add_user_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to Back Office Login...")
            page.goto("http://localhost:5000/login")

            if "login" in page.url:
                print("Logging in...")
                page.get_by_placeholder("Enter your ID").fill("admin")
                page.get_by_placeholder("Enter your password").fill("admin123")
                page.get_by_role("button", name="Sign In").click()
                page.wait_for_timeout(2000)

            print("Navigating to Users Page...")
            page.goto("http://localhost:5000/users")

            print("Opening Add User Modal...")
            page.evaluate("document.getElementById('addUserModal').classList.remove('hidden')")
            page.wait_for_timeout(500)

            print("Filling User Form...")
            unique_id = str(int(time.time()))
            username = f"user_{unique_id}"

            # Scoping to the Add User Modal to avoid ambiguity with Edit modals
            modal = page.locator("#addUserModal")
            modal.locator("input[name='name']").fill("Test User")
            modal.locator("input[name='username']").fill(username)
            modal.locator("input[name='password']").fill("password")
            modal.locator("input[name='pin']").fill("1234")

            print("Submitting Form (First Time)...")
            modal.get_by_role("button", name="Save User").click()
            page.wait_for_timeout(2000)

            # Now try to add the same user again to trigger duplicate error
            print("Opening Add User Modal (Second Time)...")
            page.evaluate("document.getElementById('addUserModal').classList.remove('hidden')")
            page.wait_for_timeout(500)

            modal.locator("input[name='name']").fill("Test User Duplicate")
            modal.locator("input[name='username']").fill(username) # Same username
            modal.locator("input[name='password']").fill("password")
            modal.locator("input[name='pin']").fill("1234")

            print("Submitting Form (Second Time - Expecting Error)...")
            modal.get_by_role("button", name="Save User").click()
            page.wait_for_timeout(2000)

            content = page.content()
            if "Username or ID already exists" in content:
                print("SUCCESS: Caught Expected Duplicate Error Message on Page")
            elif "Error adding user" in content:
                 print("SUCCESS: Caught General Error Message on Page")
            else:
                print("WARNING: Did not find expected error message. Check screenshot.")

            page.screenshot(path="verification/add_user_fix.png", full_page=True)
            print("Screenshot saved to verification/add_user_fix.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_add_user_fix()
