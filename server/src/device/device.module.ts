import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../schemas/device.schema';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('DEVICE_SECRET'),
        signOptions: { expiresIn: '365d' }, // Device tokens can have a long expiry
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DeviceService],
  controllers: [DeviceController],
})
export class DeviceModule {}
