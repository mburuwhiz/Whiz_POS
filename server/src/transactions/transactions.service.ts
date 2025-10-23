import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../../../shared/models/Transaction';

@Injectable()
export class TransactionsService {
  constructor(@InjectModel('Transaction') private readonly transactionModel: Model<Transaction>) {}

  async create(transaction: Partial<Transaction>): Promise<Transaction> {
    const newTransaction = new this.transactionModel(transaction);
    return newTransaction.save();
  }
}
