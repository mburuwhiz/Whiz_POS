from playwright.sync_api import sync_playwright
import json

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # 1. Verify Login Page loads
    print("Navigating to Login Page...")
    page.goto("http://localhost:5000/login")
    page.screenshot(path="verification/back_office_login.png")
    print("Login Page screenshot saved.")

    # 2. Verify API endpoint returns JSON (not HTML login page)
    print("Testing API Endpoint...")
    response = page.request.get("http://localhost:5000/api/products", headers={"X-API-KEY": "secret-api-key"})

    if response.status == 200:
        try:
            data = response.json()
            print(f"API Response Valid JSON: {json.dumps(data)[:100]}...")
            # Save screenshot of raw JSON (rendered by browser)
            page.goto("http://localhost:5000/api/products") # This will fail auth if not using headers, but let's see
        except Exception as e:
            print(f"API Response NOT JSON: {e}")
            print(f"Body: {response.text()[:200]}")
    else:
        print(f"API Error Status: {response.status}")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
