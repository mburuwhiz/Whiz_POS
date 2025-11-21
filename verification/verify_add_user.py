
import time
from playwright.sync_api import sync_playwright

def verify_add_user_error():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to Back Office Login...")
            page.goto("http://localhost:5000/login")

            if "login" in page.url:
                print("Logging in...")
                # Using placeholders based on previous verification
                page.get_by_placeholder("Enter your ID").fill("admin")
                page.get_by_placeholder("Enter your password").fill("admin123")
                page.get_by_role("button", name="Sign In").click()
                page.wait_for_timeout(2000)

            print("Navigating to Users Page...")
            page.goto("http://localhost:5000/users")

            print("Opening Add User Modal...")
            # Trigger the modal
            page.evaluate("document.getElementById('addUserModal').classList.remove('hidden')")

            print("Filling User Form...")
            # Fill the form
            # Using generic names to trigger error or success
            page.get_by_label("Full Name").fill("Test User")
            page.get_by_label("Username").fill("testuser_unique_123") # Use a unique name
            page.get_by_label("Password (Web)").fill("password")
            page.get_by_label("PIN (POS)").fill("1234")

            print("Submitting Form...")
            page.get_by_role("button", name="Save User").click()

            page.wait_for_timeout(2000)
            print(f"Current URL after submit: {page.url}")

            content = page.content()
            if "Error adding user" in content:
                print("Caught Expected Error: 'Error adding user'")
            else:
                print("User might have been added successfully.")

            page.screenshot(path="verification/add_user_attempt.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_add_user_error()
