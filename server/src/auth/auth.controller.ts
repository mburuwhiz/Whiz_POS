import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PinLoginDto } from './dto/pin-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('pin-login')
  pinLogin(@Body() pinLoginDto: PinLoginDto) {
    return this.authService.pinLogin(pinLoginDto);
  }
}
