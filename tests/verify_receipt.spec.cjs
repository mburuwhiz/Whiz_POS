const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

test('Receipt renders correctly', async ({ page }) => {
  // 1. Read the template
  const templatePath = path.resolve(__dirname, '../receipt-template.html');
  let template = fs.readFileSync(templatePath, 'utf8');

  // 2. Mock data
  const mockData = {
    businessName: 'My Coffee Shop',
    location: 'Downtown',
    address: '123 Main St',
    phone: '555-0123',
    receiptId: 'REC-001',
    date: '2023-10-27 10:00:00',
    customer: 'Walk-in',
    itemsHtml: `
      <tr>
        <td>Latte</td>
        <td>2</td>
        <td>4.00</td>
        <td>8.00</td>
      </tr>
      <tr>
        <td>Croissant</td>
        <td>1</td>
        <td>3.50</td>
        <td>3.50</td>
      </tr>
    `,
    subtotal: '11.50',
    total: '11.50',
    servedBy: 'John',
    paymentMethod: 'Cash',
    mpesaDetails: '',
    receiptHeader: 'Thank you!',
    receiptFooter: 'Please come again.',
    developerFooter: '<div class="footer-dev">Powerd by WhizPOS</div>'
  };

  // 3. Simple replacement
  Object.keys(mockData).forEach(key => {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), mockData[key]);
  });

  // 4. Render
  await page.setContent(template);

  // 5. Screenshot
  await page.screenshot({ path: 'receipt_verification.png', fullPage: true });
});
