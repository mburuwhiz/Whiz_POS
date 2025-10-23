import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin-login')
  async adminLogin(@Body() loginDto: any) {
    const user = await this.authService.validateAdmin(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  @Post('pin-login')
  async pinLogin(@Body() loginDto: any) {
    // Note: The PIN validation logic in AuthService is a placeholder.
    // This endpoint will not be fully functional until that is implemented.
    const user = await this.authService.validatePin(loginDto.userId, loginDto.pin);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }
}
