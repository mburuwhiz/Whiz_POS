import { Injectable } from '@nestjs/common';
import { Transaction } from '../../../shared/models/Transaction';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrintService {
  async printReceipt(transaction: Transaction): Promise<{ message: string }> {
    // In a production environment, this is where you would integrate with a
    // printer library like 'node-printer' or 'escpos' to send the receipt
    // to a physical ESC/POS printer.
    //
    // For now, we are simulating the printing process by saving the receipt
    // to a text file in the 'receipts' directory.
    const receiptDir = path.join(__dirname, '..', '..', 'receipts');
    if (!fs.existsSync(receiptDir)) {
      fs.mkdirSync(receiptDir);
    }

    let receiptContent = '--- RECEIPT ---\n';
    receiptContent += `Transaction ID: ${transaction._id}\n`;
    receiptContent += `Date: ${new Date(transaction.createdAt).toLocaleString()}\n`;
    receiptContent += '--- ITEMS ---\n';
    transaction.items.forEach(item => {
      receiptContent += `${item.name} (x${item.qty}) - ${(item.price * item.qty).toFixed(2)}\n`;
    });
    receiptContent += '---\n';
    receiptContent += `Total: ${transaction.total.toFixed(2)}\n`;
    receiptContent += `Payment Method: ${transaction.payments[0].method}\n`;
    receiptContent += '----------------\n';

    const receiptPath = path.join(receiptDir, `receipt-${transaction._id}.txt`);
    fs.writeFileSync(receiptPath, receiptContent);

    console.log(`Receipt saved to ${receiptPath}`);

    return { message: 'Receipt printed successfully' };
  }
}
