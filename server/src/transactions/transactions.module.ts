import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './transaction.schema';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Transaction', schema: TransactionSchema }])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
