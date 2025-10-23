import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from '../devices/devices.service';
import { DeviceLinkDto } from './dto/device-link.dto';

@Controller('device')
export class DeviceLinkController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('link')
  async linkDevice(@Body() deviceLinkDto: DeviceLinkDto) {
    // In a real implementation, this would be a call to the cloud portal.
    // For now, we'll use a hardcoded test API key.
    const MOCK_CLOUD_API_KEY = 'WHIZ-XXXXX';

    if (deviceLinkDto.apiKey !== MOCK_CLOUD_API_KEY) {
      throw new UnauthorizedException('Invalid API Key');
    }

    const device = await this.devicesService.create({
      businessId: 'bzn_001_dev', // Mock business ID
      fingerprint: deviceLinkDto.fingerprint,
    });

    const payload = { sub: device._id, type: 'device' };
    const deviceToken = this.jwtService.sign(payload);

    return {
      businessId: device.businessId,
      deviceToken,
      branding: {
        primaryColor: '#0047FF',
        secondaryColor: '#FFD700',
      },
    };
  }
}
