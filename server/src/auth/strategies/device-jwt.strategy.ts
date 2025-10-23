import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeviceJwtStrategy extends PassportStrategy(Strategy, 'device-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('DEVICE_SECRET'),
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT.
    // We can trust this payload because the signature has been verified.
    return { deviceId: payload.sub, businessId: payload.businessId };
  }
}
