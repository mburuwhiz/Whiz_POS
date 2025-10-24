import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MpesaService } from './mpesa.service';

@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  @Post('stk-push')
  stkPush(@Body() body: { amount: number; phoneNumber: string }) {
    return this.mpesaService.initiateStkPush(body.amount, body.phoneNumber);
  }

  @Post('callback')
  callback(@Body() body) {
    console.log('M-Pesa Callback:', body);
    // Handle the callback logic here
    return { message: 'Callback received' };
  }

  @Get('status/:checkoutRequestID')
  checkPaymentStatus(@Param('checkoutRequestID') checkoutRequestID: string) {
    return this.mpesaService.checkPaymentStatus(checkoutRequestID);
  }
}
