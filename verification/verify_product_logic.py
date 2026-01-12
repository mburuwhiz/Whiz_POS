import time
from playwright.sync_api import sync_playwright

def verify_product_logic():
    print("Starting Product Logic Verification...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox'])
        context = browser.new_context()
        page = context.new_page()

        # Capture ALL Console Messages
        console_logs = []
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

        # Inject Mock Data and Electron API
        mock_script = """
        console.log("Injecting Mocks...");

        // Clear persistence to force load from 'readData'
        localStorage.clear();

        window.electron = {
            readData: async (fileName) => {
                console.log(`[Mock] Reading ${fileName}`);
                if (fileName === 'products.json') {
                    return { success: true, data: [
                        { id: 1, name: "Apple (Low Sales)", price: 10, category: "Food" },
                        { id: 2, name: "Banana (High Sales)", price: 20, category: "Food" },
                        { id: 1, name: "Apple Copy (Duplicate)", price: 10, category: "Food" },
                        { id: 3, name: "Carrot (No Sales)", price: 5, category: "Food" }
                    ]};
                }
                if (fileName === 'transactions.json') {
                    return { success: true, data: [
                        {
                            id: "T1",
                            timestamp: new Date().toISOString(),
                            items: [{ product: { id: 2 }, quantity: 50 }],
                            status: 'completed'
                        },
                        {
                            id: "T2",
                            timestamp: new Date().toISOString(),
                            items: [{ product: { id: 1 }, quantity: 5 }],
                            status: 'completed'
                        }
                    ]};
                }
                if (fileName === 'business-setup.json') {
                    // Set isLoggedIn to true to bypass login
                    return { success: true, data: { isSetup: true, isLoggedIn: true, businessName: "Test Biz", onScreenKeyboard: false } };
                }
                if (fileName === 'users.json') {
                    // MOCK USER MUST HAVE 'isActive: true'
                    return { success: true, data: [{ id: '1', name: 'Test Admin', role: 'admin', pin: '1234', isActive: true }] };
                }

                return { success: true, data: [] };
            },
            onMobileDataSync: () => {},
            onNewMobileReceipt: () => {},
            saveData: async () => ({ success: true }),
            getPrinters: async () => [],
            getApiConfig: async () => ({}),
            auth: {
                login: async () => ({ success: true, user: { id: '1', name: 'Test Admin', role: 'admin', isActive: true } })
            },
            getConnectedDevices: async () => []
        };
        console.log("Mocks Injected Successfully");
        """

        page.add_init_script(mock_script)

        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173")

            # Login Interaction
            try:
                if page.is_visible("text=Login"):
                    print("Login screen detected. Performing login...")

                    # 1. Select User
                    # Use a more generic selector for the user card
                    # It's a button containing "Test Admin"
                    page.click("button:has-text('Test Admin')")
                    time.sleep(0.5)

                    # 2. Enter PIN (1234)
                    # The buttons have clear text content "1", "2", etc.
                    page.click("button:has-text('1')")
                    page.click("button:has-text('2')")
                    page.click("button:has-text('3')")
                    page.click("button:has-text('4')")

                    # 3. Click Login/Access POS
                    page.click("button:has-text('Access POS')")

                page.wait_for_selector("#product-grid", timeout=15000)
                print("Product Grid loaded.")
            except Exception:
                print("Timed out waiting for #product-grid.")
                raise

            # 1. Check for Console Warnings (Duplicate Keys)
            time.sleep(2)

            key_warnings = [msg for msg in console_logs if "same key" in msg or "unique" in msg]
            if key_warnings:
                print("❌ FAILED: React Key Warnings detected!")
                for w in key_warnings:
                    print(f"  - {w}")
            else:
                print("✅ PASSED: No React Key warnings detected.")

            # 2. Verify Deduplication
            products = page.query_selector_all("#product-grid > div.grid > div")
            print(f"Found {len(products)} products on grid.")

            if len(products) != 3:
                print(f"❌ FAILED: Expected 3 unique products, found {len(products)}")
                for p in products:
                    print("  - " + p.inner_text().split('\n')[0])
            else:
                print("✅ PASSED: Duplicate products removed.")

            # 3. Verify Sorting (Popularity)
            product_names = [p.inner_text().split('\n')[0] for p in products]
            print(f"Product Order: {product_names}")

            if len(product_names) >= 3 and "Banana" in product_names[0] and "Apple" in product_names[1] and "Carrot" in product_names[2]:
                print("✅ PASSED: Products sorted by popularity correctly.")
            else:
                print("❌ FAILED: Sorting incorrect.")

            # Take screenshot for frontend verification
            page.screenshot(path="verification/verification.png")

        except Exception as e:
            print(f"❌ ERROR: {e}")
            print("\n--- Console Logs ---")
            for log in console_logs:
                print(log)

        browser.close()

if __name__ == "__main__":
    verify_product_logic()
