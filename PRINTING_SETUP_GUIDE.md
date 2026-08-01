# Whiz POS - Silent Printing & Templates Setup Guide

This guide details exactly how Whiz POS handles silent thermal printing, data aggregation, and our finely-tuned 80mm HTML templates. You can use these snippets and configurations to perfectly replicate this behavior in your own multi-outlet POS system.

## 1. Electron Silent Printing Implementation

The core of our silent printing relies on Electron's `BrowserWindow` and `webContents.print()`. The key is bypassing the print dialog when a default printer is selected in settings, and forcing margins to `0` so the thermal printer perfectly honors the HTML CSS dimensions.

Here is the exact function from our `electron.cjs` that handles this:

```javascript
  /**
   * Creates a hidden BrowserWindow to render HTML content and triggers the print dialog or silent print.
   *
   * @param {string} htmlContent - The HTML string to print.
   * @param {Object} options - Electron print options.
   */
  const printHtml = async (htmlContent, options = {}) => {
    // 1. Create a hidden window for rendering
    const printWindow = new BrowserWindow({
        show: false,
        webPreferences: { contextIsolation: false, nodeIntegration: true }
    });

    // 2. Check for saved printer preferences (stored via electron-store or similar)
    const printerSettings = store.get('printerSettings', {});
    if (printerSettings.defaultPrinter) {
        options.deviceName = printerSettings.defaultPrinter; // Target specific printer
        options.silent = true; // Skip dialog if a printer is explicitly set
    }

    // 3. Load the HTML content into the hidden window
    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // 4. Wait for it to finish loading, then trigger print
    printWindow.webContents.on('did-finish-load', () => {
        // Force margins to 0 for better fit on thermal printers
        // This is CRITICAL. Without this, Electron adds default margins that mess up 80mm layouts.
        const printOptions = {
             margins: { marginType: 'custom', top: 0, bottom: 0, left: 0, right: 0 },
             ...options
        };

        printWindow.webContents.print(printOptions, (success, errorType) => {
            if (!success) console.error('Print failed:', errorType);
            else console.log('Print job sent successfully');
            printWindow.close(); // Clean up memory
        });
    });
  };
```

### Exposing Print Triggers via IPC

We listen for IPC events from the React frontend to trigger these print jobs:

```javascript
  ipcMain.on('print-receipt', async (event, transaction, businessSetup, isReprint = false) => {
      const htmlContent = await generateReceipt(transaction, businessSetup, isReprint);
      printHtml(htmlContent);
  });

  ipcMain.on('print-closing-report', async (event, reportData, businessSetup, detailed = true) => {
      const htmlContent = await generateClosingReport(reportData, businessSetup, detailed);
      printHtml(htmlContent);
  });
```

---

## 2. HTML Generation (Data Hydration)

We use basic string replacement to hydrate HTML templates. This avoids heavy templating engines and keeps the rendering extremely fast. Here is the `generateReceipt` function from our `print-jobs.cjs`:

```javascript
const fs = require('fs').promises;
const path = require('path');

const formatDate = (timestamp) => {
    if (!timestamp) return new Date().toLocaleString();
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${year}-${month}-${day} ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

async function generateReceipt(transaction, businessSetup, isReprint = false) {
    const templatePath = path.join(__dirname, 'receipt-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    const total = transaction.total || 0;
    const subtotal = transaction.subtotal || total;
    const tax = transaction.tax || 0;
    const paymentMethod = transaction.paymentMethod ? transaction.paymentMethod.toUpperCase() : 'CASH';

    template = template.replace('{{businessName}}', businessSetup?.businessName || 'WHIZ POS');
    template = template.replace('{{location}}', 'Kagwe Town | ' + (businessSetup?.phone || ''));
    template = template.replace('{{address}}', businessSetup?.address || '');
    template = template.replace('{{phone}}', '');
    template = template.replace('{{receiptId}}', transaction.id + (isReprint ? ' (REPRINT)' : ''));
    template = template.replace('{{date}}', formatDate(transaction.timestamp));

    const cashierName = transaction.cashier || 'Cashier';
    const servedByFirstName = cashierName.split(' ')[0];
    template = template.replace('{{servedBy}}', servedByFirstName);

    let customerName = 'Walk Through Customer';
    if (paymentMethod === 'CREDIT' && transaction.creditCustomer) {
        customerName = transaction.creditCustomer;
    }
    template = template.replace('{{customer}}', customerName);
    template = template.replace('{{paymentMethod}}', paymentMethod);

    let paymentDetailsHtml = '';
    if (paymentMethod === 'CASH' && transaction.amountTendered !== undefined) {
        paymentDetailsHtml = `
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px;">
                <span>Amount Tendered:</span>
                <span>Ksh ${parseFloat(transaction.amountTendered).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-top: 2px;">
                <span>Change:</span>
                <span>Ksh ${parseFloat(transaction.change || 0).toFixed(2)}</span>
            </div>
        `;
    }
    template = template.replace('{{paymentDetailsHtml}}', paymentDetailsHtml);

    template = template.replace('{{subtotal}}', `Ksh ${subtotal.toFixed(2)}`);
    template = template.replace('{{total}}', `Ksh ${total.toFixed(2)}`);
    template = template.replace('{{receiptHeader}}', businessSetup?.receiptHeader || '');

    const footerText = businessSetup?.receiptFooter;
    const footerHtml = footerText ? `<p>${footerText}</p>` : '';
    template = template.replace('{{receiptFooter}}', footerHtml);

    // Items Table
    const items = transaction.items || [];
    const itemsHtml = items.map(item => {
        const product = item.product || {};
        const price = parseFloat(product.price || item.price) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        const lineTotal = price * quantity;

        return `
        <tr>
            <td>${product.name || 'Unknown Item'}</td>
            <td class="qty">${quantity}</td>
            <td class="price">${price.toFixed(2)}</td>
            <td class="total">${lineTotal.toFixed(2)}</td>
        </tr>
    `}).join('');
    template = template.replace('{{itemsHtml}}', itemsHtml);

    let mpesaDetailsHtml = '';
    let details = [];
    if (businessSetup?.mpesaPaybill) {
        details.push(`<p>Paybill No: <b>${businessSetup.mpesaPaybill}</b> | A/C No: <b>${businessSetup.mpesaAccountNumber || 'Business No'}</b></p>`);
    }
    if (businessSetup?.mpesaTill) {
        details.push(`<p style="text-align: center;">Pay By Till : <b>${businessSetup.mpesaTill}</b></p>`);
    }
    if (details.length > 0) {
        mpesaDetailsHtml = `<div class="separator"></div><div class="info">${details.join('')}</div>`;
    }
    template = template.replace('{{mpesaDetails}}', mpesaDetailsHtml);
    template = template.replace('{{developerFooter}}', '');

    return template;
}
```

---

## 3. The 80mm HTML Templates

The most common issue with thermal printers is layout stretching, cut-off text, or massive whitespace on the sides. To fix this, we hardcode the CSS `@page` size to `80mm auto` and restrict the body width to `70mm` with a `5mm` left margin. This centers the content perfectly and prevents the printer driver from arbitrarily scaling the content.

### `receipt-template.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt</title>
    <style>
        @page {
            margin: 0;
            size: 80mm auto; /* Physical paper size */
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10.5px;
            font-weight: bold;
            color: #000;
            margin: 0;
            padding: 0;

            /* Content width restricted to 70mm to prevent stretching.
               margin-left: 5mm centers it on 80mm paper (5mm + 70mm + 5mm = 80mm). */
            width: 70mm;
            margin-left: 5mm;
        }
        .container { padding: 5px 0; box-sizing: border-box; width: 100%; }
        .header { text-align: center; margin-bottom: 5px; }
        .header h1 { font-size: 18px; margin: 0 0 2px 0; text-transform: uppercase; }
        .header p, .info p, .footer p { margin: 2px 0; }
        .separator { border-top: 1px dashed #000; margin: 5px 0; }
        .info { margin-bottom: 5px; }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed; /* Enforce strict column widths */
        }
        th { text-align: left; border-bottom: 1px dashed #000; padding-bottom: 2px; }
        td { padding: 2px 0; vertical-align: top; word-wrap: break-word; }

        /* 4-Column Layout Styles - Adjusted for 70mm content area */
        th:nth-child(1), td:nth-child(1) { width: 40%; } /* Item */
        th:nth-child(2), td:nth-child(2) { width: 15%; text-align: center; } /* Qty */
        th:nth-child(3), td:nth-child(3) { width: 20%; text-align: right; } /* Price */
        th:nth-child(4), td:nth-child(4) { width: 25%; text-align: right; } /* Total */

        .totals { margin-top: 5px; }
        .totals .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .totals .total-row { font-weight: 900; font-size: 14px; margin-top: 4px; border-top: 1px dashed #000; padding-top: 4px; }
        .footer { text-align: center; margin-top: 10px; font-size: 11px; }
        .payment-line { display: flex; justify-content: space-between; flex-wrap: wrap; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{businessName}}</h1>
            <p>{{location}}</p>
            <p>{{address}}</p>
            <p>{{phone}}</p>
        </div>
        <div class="separator"></div>
        <div class="info">
            <p>Receipt #: {{receiptId}}</p>
            <p>Date: {{date}}</p>
            <p>Customer: {{customer}}</p>
        </div>
        <div class="separator"></div>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="qty">Qty</th>
                    <th class="price">@</th>
                    <th class="total">Total</th>
                </tr>
            </thead>
            <tbody>
                {{itemsHtml}}
            </tbody>
        </table>
        <div class="separator"></div>
        <div class="totals">
            <div class="row">
                <span>Subtotal:</span>
                <span>{{subtotal}}</span>
            </div>
            <div class="row total-row">
                <span>TOTAL:</span>
                <span>{{total}}</span>
            </div>
        </div>
        <div class="separator"></div>
        <div class="info">
            <div class="payment-line">
                <span>Served By: {{servedBy}}</span>
                <span>Payment : {{paymentMethod}}</span>
            </div>
            {{paymentDetailsHtml}}
        </div>
        <div style="text-align: center;">
            {{mpesaDetails}}
        </div>
        <div class="separator"></div>
        <div class="footer">
            <p>{{receiptHeader}}</p>
            {{receiptFooter}}
        </div>
        <div class="separator"></div>
        {{developerFooter}}
    </div>
</body>
</html>
```

### `closing-report-template.html`

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        @page { margin: 0; size: 80mm auto; }
        body {
            font-family: Arial, sans-serif;
            font-size: 10.5px;
            font-weight: bold;
            color: #000;
            margin: 0;
            padding: 0;
            width: 70mm;
            margin-left: 5mm;
            box-sizing: border-box;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }

        .header { margin-bottom: 5px; text-align: center; }
        .business-name { font-size: 16px; margin-bottom: 2px; }
        hr { border: none; border-top: 1px dashed #000; margin: 5px 0; }
        .report-title { font-size: 12px; margin: 5px 0; }
        .grand-total-section { margin-top: 5px; font-size: 11px; }

        table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 10.5px; }
        th, td { padding: 2px 0; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
    </style>
</head>
<body>
    <div class="header">
        <div class="business-name bold uppercase">{{businessName}}</div>
        <div>{{businessAddress}}</div>
        <div>{{businessPhone}}</div>
    </div>
    <hr/>
    <div class="text-center">
        <div class="report-title bold">END DAY REPORT</div>
        <div>{{date}}</div>
    </div>
    <hr/>

    <!-- Dynamic Cashier Sections Injected Here -->
    {{cashierSections}}

    <hr/>
    <div class="grand-total-section">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
             <span>Total Cash:</span><span>{{totalCash}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
             <span>Total M-Pesa:</span><span>{{totalMpesa}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
             <span>Total Credit:</span><span>{{totalCredit}}</span>
        </div>
        <hr style="border-top: 1px dashed #000; margin: 5px 0;"/>
        <div style="display: flex; justify-content: space-between; font-size: 12px;">
            <span class="bold">GRAND TOTAL:</span>
            <span class="bold">{{grandTotal}}</span>
        </div>
    </div>
    <hr/>
    <div class="text-center" style="margin-top: 10px;">
        *** END OF REPORT ***
    </div>
</body>
</html>
```

## Setup Summary
To get perfect prints on thermal printers using web technologies:
1. Hardcode `@page { size: 80mm auto; margin: 0; }` in your CSS.
2. Ensure your `body` width is slightly smaller (e.g. `70mm`) and properly margined to fit exactly in the center (`margin-left: 5mm`).
3. Set Electron's margins to `{ marginType: 'custom', top: 0, bottom: 0, left: 0, right: 0 }`.
4. Use `options.silent = true` and `options.deviceName = printerSettings.defaultPrinter` to bypass the print dialog.
