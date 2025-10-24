import { Controller, Post, Body } from '@nestjs/common';
import { PrintService } from './print.service';
import { Transaction } from '../../../shared/models/Transaction';

@Controller('print')
export class PrintController {
  constructor(private readonly printService: PrintService) {}

  @Post('receipt')
  printReceipt(@Body() transaction: Transaction) {
    return this.printService.printReceipt(transaction);
  }
}
