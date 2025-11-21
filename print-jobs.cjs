const { app } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const qrcode = require('qrcode');

/**
 * Formats a timestamp into a readable date string (YYYY-MM-DD HH:MM AM/PM).
 *
 * @param {number|string} timestamp - The timestamp to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (timestamp) => {
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
 * Replaces placeholders in the template with actual transaction data.
 *
 * @param {Object} transaction - The transaction data object.
 * @param {Object} businessSetup - The business configuration details.
 * @param {boolean} [isReprint=false] - Flag to indicate if this is a reprinted receipt.
 * @returns {Promise<string>} A promise that resolves to the complete HTML string.
 */
async function generateReceipt(transaction, businessSetup, isReprint = false) {
    const templatePath = app.isPackaged
        ? path.join(app.getAppPath(), 'receipt-template.html')
        : path.join(__dirname, 'receipt-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    template = template.replace('{{businessName}}', businessSetup?.businessName || '');
    template = template.replace('{{address}}', businessSetup?.address || '');
    template = template.replace('{{phone}}', businessSetup?.phone || '');
    template = template.replace('{{receiptId}}', transaction.id);
    template = template.replace('{{date}}', formatDate(transaction.timestamp));
    template = template.replace('{{servedBy}}', transaction.cashier);
    template = template.replace('{{subtotal}}', `Ksh ${transaction.subtotal.toFixed(2)}`);
    template = template.replace('{{tax}}', `Ksh ${transaction.tax.toFixed(2)}`);
    template = template.replace('{{total}}', `Ksh ${transaction.total.toFixed(2)}`);
    template = template.replace('{{paymentMethod}}', transaction.paymentMethod.toUpperCase());
    template = template.replace('{{mpesaPaybill}}', businessSetup?.mpesaPaybill || '');
    template = template.replace('{{mpesaAccountNumber}}', businessSetup?.mpesaAccountNumber || '');
    template = template.replace('{{receiptFooter}}', businessSetup?.receiptFooter || '');

    const itemsHtml = transaction.items.map(item => `
        <div class="item-row">
            <span>${item.product.name}</span>
            <span>${item.quantity} x ${item.product.price.toFixed(2)}</span>
            <span>${(item.quantity * item.product.price).toFixed(2)}</span>
        </div>
    `).join('');
    template = template.replace('{{#items}}...{{/items}}', itemsHtml);

    return template;
}

/**
 * Generates the HTML content for the daily closing report.
 * Aggregates sales data and includes breakdowns by cashier.
 *
 * @param {Object} reportData - The aggregated report data.
 * @param {Object} businessSetup - The business configuration details.
 * @returns {Promise<string>} A promise that resolves to the complete HTML string.
 */
async function generateClosingReport(reportData, businessSetup) {
    const templatePath = app.isPackaged
      ? path.join(app.getAppPath(), 'closing-report-template.html')
      : path.join(__dirname, 'closing-report-template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    template = template.replace('{{businessName}}', businessSetup?.businessName || '');
    template = template.replace('{{businessAddress}}', businessSetup?.address || '');
    template = template.replace('{{businessPhone}}', businessSetup?.phone || '');
    template = template.replace('{{date}}', new Date(reportData.date).toDateString());
    template = template.replace('{{totalCash}}', `Ksh. ${reportData.totalCash.toFixed(2)}`);
    template = template.replace('{{totalMpesa}}', `Ksh. ${reportData.totalMpesa.toFixed(2)}`);
    template = template.replace('{{totalCredit}}', `Ksh. ${reportData.totalCredit.toFixed(2)}`);
    template = template.replace('{{grandTotal}}', `Ksh. ${reportData.grandTotal.toFixed(2)}`);

    const cashierReportsHtml = reportData.cashiers.map(cashier => {
        let creditTransactionsHtml = '';
        if (cashier.creditTransactions.length > 0) {
            creditTransactionsHtml = `
                <p class="bold">Credit Transactions:</p>
                <table class="table">
                    <tbody>
                        ${cashier.creditTransactions.map(t => `
                            <tr>
                                <td class="label">${t.customerName}</td>
                                <td class="value">${t.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        return `
            <div class="cashier-section">
                <p class="bold">CASHIER: ${cashier.cashierName.toUpperCase()}</p>
                <hr>
                <table class="table">
                    <tbody>
                        <tr><td class="label">Cash Sales:</td><td class="value">Ksh. ${cashier.cashTotal.toFixed(2)}</td></tr>
                        <tr><td class="label">M-Pesa Sales:</td><td class="value">Ksh. ${cashier.mpesaTotal.toFixed(2)}</td></tr>
                        <tr><td class="label">Credit Sales:</td><td class="value">Ksh. ${cashier.creditTotal.toFixed(2)}</td></tr>
                        <tr><td class="label">Total Sales:</td><td class="value">Ksh. ${cashier.totalSales.toFixed(2)}</td></tr>
                    </tbody>
                </table>
                ${creditTransactionsHtml}
            </div>
        `;
    }).join('');
    template = template.replace('{{cashierReports}}', cashierReportsHtml);

    return template;
}

/**
 * Generates the HTML content for the initial business setup invoice.
 *
 * @param {Object} businessSetup - The business configuration details.
 * @param {Object} adminUser - The administrative user's details.
 * @returns {Promise<string>} A promise that resolves to the complete HTML string.
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
