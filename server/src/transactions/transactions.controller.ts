import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../../../shared/models/Transaction';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() transaction: Transaction) {
    return this.transactionsService.create(transaction);
  }

  @Get('unpaid')
  findUnpaid() {
    return this.transactionsService.findUnpaid();
  }

  @Patch(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.transactionsService.markAsPaid(id);
  }

  @Get('summary/today')
  getTodaysSummary() {
    return this.transactionsService.getTodaysSummary();
  }
}
