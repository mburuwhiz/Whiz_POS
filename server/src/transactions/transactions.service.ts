import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from '../schemas/transaction.schema';
import { CreateTransactionDto } from '@whiz-pos/shared';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    deviceInfo: { deviceId: string; businessId: string },
  ): Promise<Transaction> {
    const newTransaction = new this.transactionModel({
      ...createTransactionDto,
      deviceId: deviceInfo.deviceId,
      businessId: deviceInfo.businessId,
      status: 'COMPLETED', // Default status
    });
    return newTransaction.save();
  }
}
