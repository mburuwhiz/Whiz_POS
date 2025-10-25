import { Controller, Post, Body } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../../../shared/models/Transaction';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() transaction: Transaction) {
    return this.transactionsService.create(transaction);
  }
}
