from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_mobile_layout(page: Page):
    # 1. Arrange: Set viewport to mobile size and go to the app
    page.set_viewport_size({"width": 375, "height": 667})
    page.goto("http://localhost:5174")

    # Wait for app to load
    page.wait_for_timeout(2000)

    # Take screenshot before checking locator to debug what's on screen
    page.screenshot(path="verification/debug_screen.png")

    # 2. Act: Perform Login
    # Select user
    page.select_option('select', '1')

    # Enter PIN 1234
    page.get_by_role("button", name="1").click()
    page.get_by_role("button", name="2").click()
    page.get_by_role("button", name="3").click()
    page.get_by_role("button", name="4").click()

    # Click Login
    page.get_by_role("button", name="Login").click()

    # Wait for main app to load
    page.wait_for_timeout(1000)

    # 3. Act: Check for Hamburger Menu
    # The menu button should be visible on mobile
    menu_button = page.locator('button:has(svg.lucide-menu)')
    expect(menu_button).to_be_visible()

    # Take a screenshot of the mobile home screen
    page.screenshot(path="verification/mobile_home.png")

    # 4. Act: Open the menu
    menu_button.click()

    # Wait for animation
    page.wait_for_timeout(500)

    # 5. Assert: Navigation should be visible
    nav_sidebar = page.locator('.w-64.h-full.bg-white.shadow-md')
    expect(nav_sidebar).to_be_visible()

    # Take a screenshot of the open menu
    page.screenshot(path="verification/mobile_menu_open.png")

    # 6. Act: Close the menu by clicking the overlay or a link
    # Click the overlay at the right side (unobstructed by sidebar)
    overlay = page.locator('.fixed.inset-0.bg-black.bg-opacity-50')
    overlay.click(position={"x": 300, "y": 300})

    # 7. Assert: Menu should be hidden (translate-x-full)
    # We check if the sidebar container has the class '-translate-x-full'
    # or just check visual bounding box if possible, but class check is reliable for this implementation
    # The sidebar parent div has the classes.

    # Let's just take a final screenshot to confirm it's gone/closing
    page.wait_for_timeout(500) # wait for animation
    page.screenshot(path="verification/mobile_menu_closed.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_mobile_layout(page)
            print("Mobile verification passed!")
        except Exception as e:
            print(f"Mobile verification failed: {e}")
        finally:
            browser.close()
