import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MpesaService {
  private readonly consumerKey = process.env.MPESA_CONSUMER_KEY;
  private readonly consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  private readonly shortCode = process.env.MPESA_SHORTCODE;
  private readonly passkey = process.env.MPESA_PASSKEY;
  private readonly callbackUrl = process.env.MPESA_CALLBACK_URL;

  private async getAccessToken(): Promise<string> {
    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = 'Basic ' + Buffer.from(this.consumerKey + ':' + this.consumerSecret).toString('base64');

    const response = await axios.get(url, {
      headers: {
        Authorization: auth,
      },
    });

    return response.data.access_token;
  }

  async initiateStkPush(amount: number, phoneNumber: string) {
    const accessToken = await this.getAccessToken();
    const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
    const password = Buffer.from(this.shortCode + this.passkey + timestamp).toString('base64');

    const data = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: this.shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: 'WHIZ POS',
      TransactionDesc: 'Payment for goods',
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    return response.data;
  }

  async checkPaymentStatus(checkoutRequestID: string) {
    const accessToken = await this.getAccessToken();
    const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
    const password = Buffer.from(this.shortCode + this.passkey + timestamp).toString('base64');

    const data = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    return response.data;
  }
}
