import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PinLoginDto } from './dto/pin-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async pinLogin(pinLoginDto: PinLoginDto) {
    const user = await this.usersService.findOneById(pinLoginDto.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user ID or PIN.');
    }

    const isPinMatching = await bcrypt.compare(pinLoginDto.pin, user.pinHash);

    if (!isPinMatching) {
      throw new UnauthorizedException('Invalid user ID or PIN.');
    }

    const payload = { sub: user._id, roles: user.roles };

    return {
      token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        name: user.name,
        roles: user.roles,
      },
      sessionExpires: new Date(Date.now() + 3600 * 1000).toISOString(),
    };
  }
}
