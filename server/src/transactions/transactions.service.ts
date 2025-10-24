import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../../../shared/models/Transaction';

@Injectable()
export class TransactionsService {
  constructor(@InjectModel('Transaction') private readonly transactionModel: Model<Transaction>) {}

  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    // If the payment method is 'credit', set isPaid to false.
    // Otherwise, it will default to true as per the schema.
    if (transaction.payments.some((p) => p.method === 'credit')) {
      transaction.isPaid = false;
    }

    const newTransaction = new this.transactionModel(transaction);
    return newTransaction.save();
  }

  async findUnpaid(): Promise<Transaction[]> {
    return this.transactionModel.find({ isPaid: false }).exec();
  }

  async markAsPaid(id: string): Promise<Transaction> {
    return this.transactionModel.findByIdAndUpdate(id, { isPaid: true }, { new: true }).exec();
  }

  async getTodaysSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysTransactions = await this.transactionModel.find({ createdAt: { $gte: today } }).exec();

    const summary = {
      totalSales: 0,
      cash: 0,
      card: 0,
      credit: {
        total: 0,
        paid: 0,
        unpaid: 0,
      },
      mpesa: 0,
    };

    for (const transaction of todaysTransactions) {
      summary.totalSales += transaction.total;
      for (const payment of transaction.payments) {
        summary[payment.method] += payment.amount;
        if (payment.method === 'credit') {
          summary.credit.total += payment.amount;
          if (transaction.isPaid) {
            summary.credit.paid += payment.amount;
          } else {
            summary.credit.unpaid += payment.amount;
          }
        }
      }
    }

    return summary;
  }
}
