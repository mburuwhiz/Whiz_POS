import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { DeviceAuthGuard } from '../auth/guards/device-auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @UseGuards(DeviceAuthGuard)
  @Post()
  createTransaction(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    // req.user is populated by the DeviceJwtStrategy
    const { deviceId, businessId } = req.user;

    return this.transactionsService.create(createTransactionDto, { deviceId, businessId });
  }
}
