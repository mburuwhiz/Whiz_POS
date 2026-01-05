const { app } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const qrcode = require('qrcode');

/**
 * Helper function to format a timestamp into a readable date string.
 * Format: YYYY-MM-DD HH:MM AM/PM
 *
 * @param {string|number} timestamp - The date to format.
 * @returns {string} The formatted date string.
 */
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

/**
 * Generates the HTML content for a transaction receipt.
 *
 * @param {Transaction} transaction - The transaction details.
 * @param {BusinessSetup} businessSetup - The business configuration.
 * @param {boolean} isReprint - Whether this is a reprint (adds a label).
 * @returns {Promise<string>} The populated HTML string.
 */
async function generateReceipt(transaction, businessSetup, isReprint = false) {
    const templatePath = app.isPackaged
        ? path.join(app.getAppPath(), 'receipt-template.html')
        : path.join(__dirname, 'receipt-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    const total = transaction.total || 0;
    const subtotal = transaction.subtotal || total;
    const tax = transaction.tax || 0;
    const paymentMethod = transaction.paymentMethod ? transaction.paymentMethod.toUpperCase() : 'CASH';

    template = template.replace('{{businessName}}', businessSetup?.businessName || 'WHIZ POS');
    template = template.replace('{{location}}', 'Kagwe Town   |   ' + (businessSetup?.phone || ''));
    template = template.replace('{{address}}', businessSetup?.address || '');
    template = template.replace('{{phone}}', '');
    template = template.replace('{{receiptId}}', transaction.id + (isReprint ? ' (REPRINT)' : ''));
    template = template.replace('{{date}}', formatDate(transaction.timestamp));

    // Served By - First Name Only
    const cashierName = transaction.cashier || 'Cashier';
    const servedByFirstName = cashierName.split(' ')[0];
    // Use regex to replace all occurrences and handle potential spacing issues
    template = template.replace(/\{\{\s*servedBy\s*\}\}/g, servedByFirstName);

    let customerName = 'Walk Through Customer';
    if (paymentMethod === 'CREDIT' && transaction.creditCustomer) {
        customerName = transaction.creditCustomer;
    }
    template = template.replace('{{customer}}', customerName);

    template = template.replace('{{paymentMethod}}', paymentMethod);
    template = template.replace('{{subtotal}}', `Ksh ${subtotal.toFixed(2)}`);
    template = template.replace('{{tax}}', `Ksh ${tax.toFixed(2)}`);
    template = template.replace('{{total}}', `Ksh ${total.toFixed(2)}`);

    template = template.replace('{{receiptHeader}}', businessSetup?.receiptHeader || 'Thank you for your business!');

    // Conditionally include footer paragraph only if content exists
    const footerText = businessSetup?.receiptFooter;
    const footerHtml = footerText ? `<p>${footerText}</p>` : '';
    template = template.replace('{{receiptFooter}}', footerHtml);

    // Handle Developer Footer Visibility
    const showDevFooter = businessSetup?.showDeveloperFooter !== false ? 'block' : 'none';
    template = template.replace('{{showDeveloperFooter}}', showDevFooter);

    // Generate Items HTML
    const items = transaction.items || [];
    const itemsHtml = items.map(item => {
        const product = item.product || {};
        const price = product.price || 0;
        const quantity = item.quantity || 0;
        const lineTotal = quantity * price;
        return `
        <tr>
            <td>${product.name || 'Unknown Item'}</td>
            <td class="qty">${quantity}</td>
            <td class="price">${price.toFixed(2)}</td>
            <td class="total">${lineTotal.toFixed(2)}</td>
        </tr>
    `}).join('');
    template = template.replace('{{itemsHtml}}', itemsHtml);

    // Generate M-Pesa Details HTML if applicable
    let mpesaDetailsHtml = '';
    let details = [];

    if (businessSetup?.mpesaPaybill) {
        details.push(`<p>Paybill No: <b>${businessSetup.mpesaPaybill}</b> | A/C No: <b>${businessSetup.mpesaAccountNumber || 'Business No'}</b></p>`);
    }

    if (businessSetup?.mpesaTill) {
        details.push(`<p style="text-align: center;">Pay By Till : <b>${businessSetup.mpesaTill}</b></p>`);
    }

    if (details.length > 0) {
        mpesaDetailsHtml = `
            <div class="separator"></div>
            <div class="info">
                ${details.join('')}
            </div>
        `;
    }
    template = template.replace('{{mpesaDetails}}', mpesaDetailsHtml);

    return template;
}

/**
 * Generates the HTML content for the daily closing report.
 *
 * @param {ClosingReportData} reportData - The aggregated report data.
 * @param {BusinessSetup} businessSetup - The business configuration.
 * @param {boolean} detailed - Whether to include detailed transactions/expenses.
 * @returns {Promise<string>} The populated HTML string.
 */
async function generateClosingReport(reportData, businessSetup, detailed = true) {
    const templatePath = app.isPackaged
      ? path.join(app.getAppPath(), 'closing-report-template.html')
      : path.join(__dirname, 'closing-report-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    template = template.replace('{{businessName}}', businessSetup?.businessName || '');
    template = template.replace('{{businessAddress}}', businessSetup?.address || '');
    template = template.replace('{{businessPhone}}', businessSetup?.phone || '');
    template = template.replace('{{date}}', new Date(reportData.date).toDateString());
    template = template.replace('{{totalCash}}', `Ksh. ${(reportData.totalCash || 0).toFixed(2)}`);
    template = template.replace('{{totalMpesa}}', `Ksh. ${(reportData.totalMpesa || 0).toFixed(2)}`);
    template = template.replace('{{totalCredit}}', `Ksh. ${(reportData.totalCredit || 0).toFixed(2)}`);
    template = template.replace('{{grandTotal}}', `Ksh. ${(reportData.grandTotal || 0).toFixed(2)}`);

    // Generate Item Sales HTML - Only if detailed is true
    let itemSalesHtml = '';
    let itemSalesSection = '';

    if (detailed && reportData.itemSales && reportData.itemSales.length > 0) {
        const rows = reportData.itemSales.map(item => {
            return `
                <tr>
                    <td class="label">${item.name}</td>
                    <td class="qty" style="text-align: center;">${item.quantity}</td>
                    <td class="value">${item.total.toFixed(0)}</td>
                </tr>
            `;
        }).join('');

        itemSalesSection = `
            <div class="section-header">ITEM SALES REPORT</div>
            <div class="separator"></div>
            <table>
                <thead>
                    <tr>
                        <th class="label">Item</th>
                        <th class="qty" style="text-align: center;">Qty</th>
                        <th class="value">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            <div class="separator"></div>
        `;
    }

    template = template.replace('{{itemSalesSection}}', itemSalesSection);

    // Generate Cashier Breakdown HTML
    const cashierBreakdownHtml = reportData.cashiers ? reportData.cashiers.map(cashier => {
        return `
            <div class="cashier-block">
                <div class="cashier-name">Cashier: ${cashier.cashierName}</div>
                <div class="cashier-row">
                    <span>Cash:</span><span>${cashier.cashTotal.toFixed(0)}</span>
                </div>
                <div class="cashier-row">
                    <span>M-Pesa:</span><span>${cashier.mpesaTotal.toFixed(0)}</span>
                </div>
                <div class="cashier-row">
                    <span>Credit:</span><span>${cashier.creditTotal.toFixed(0)}</span>
                </div>
                <div class="cashier-row" style="font-weight: 900; margin-top: 2px;">
                    <span>Total:</span><span>${cashier.totalSales.toFixed(0)}</span>
                </div>
            </div>
        `;
    }).join('') : '';

    template = template.replace('{{cashierBreakdown}}', cashierBreakdownHtml);

    return template;
}

/**
 * Generates the HTML content for the initial business setup invoice.
 *
 * @param {BusinessSetup} businessSetup - The business configuration.
 * @param {User} adminUser - The admin user details.
 * @returns {Promise<string>} The populated HTML string.
 */
async function generateBusinessSetup(businessSetup, adminUser) {
    const templatePath = app.isPackaged
      ? path.join(app.getAppPath(), 'startup-invoice-template.html')
      : path.join(__dirname, 'startup-invoice-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    template = template.replace('{{businessName}}', businessSetup?.businessName || '');
    template = template.replace('{{businessAddress}}', businessSetup?.address || '');
    template = template.replace('{{businessPhone}}', businessSetup?.phone || '');
    template = template.replace('{{adminName}}', adminUser?.name || '');
    template = template.replace('{{adminPin}}', adminUser?.pin || '');

    return template;
}

module.exports = {
  generateReceipt,
  generateClosingReport,
  generateBusinessSetup,
};
