import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.passwordHash) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        const { passwordHash, pinHash, ...result } = user.toObject();
        return result;
      }
    }
    return null;
  }

  async validatePin(userId: string, pin: string): Promise<any> {
    const user = await this.usersService.findOneById(userId);
    if (user && user.pinHash) {
      const isMatch = await bcrypt.compare(pin, user.pinHash);
      if (isMatch) {
        const { passwordHash, pinHash, ...result } = user.toObject();
        return result;
      }
    }
    return null;
  }

  async login(user: Omit<User, 'passwordHash' | 'pinHash'>) {
    const payload = { sub: user._id.toString(), roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
