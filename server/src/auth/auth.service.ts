import { Injectable } from '@nestjs/common';
import { PinLoginDto } from './dto/pin-login.dto';

@Injectable()
export class AuthService {
  pinLogin(pinLoginDto: PinLoginDto) {
    console.log('New Server - PIN Login attempt:', pinLoginDto);
    // In a real implementation, you would validate the PIN and user here.
    return {
      token: 'sample-jwt-token-from-new-server',
      user: {
        _id: pinLoginDto.userId,
        name: 'Jane Cashier',
        roles: ['Cashier'],
      },
      sessionExpires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }
}
