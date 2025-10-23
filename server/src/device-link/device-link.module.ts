import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DevicesModule } from '../devices/devices.module';
import { DeviceLinkController } from './device-link.controller';

@Module({
  imports: [
    DevicesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('DEVICE_SECRET'),
        signOptions: { expiresIn: '365d' }, // Device tokens should be long-lived
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DeviceLinkController],
})
export class DeviceLinkModule {}
