import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { LinkDeviceDto } from './dto/link-device.dto';

// This is a placeholder for the response from the cloud portal.
interface CloudVerificationResponse {
  businessId: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
}

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    private jwtService: JwtService,
  ) {}

  async linkDevice(
    linkDeviceDto: LinkDeviceDto,
  ): Promise<{ deviceToken: string; branding: any }> {
    // 1. Simulate a call to the cloud portal to verify the API key.
    const cloudResponse = await this.verifyApiKeyWithCloud(linkDeviceDto.apiKey);

    if (!cloudResponse) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // 2. Check if this device is already registered.
    let device = await this.deviceModel.findOne({
      fingerprint: linkDeviceDto.fingerprint,
    });

    if (!device) {
      // 3. If not, create a new device record.
      device = new this.deviceModel({
        businessId: cloudResponse.businessId,
        fingerprint: linkDeviceDto.fingerprint,
        lastSeen: new Date(),
      });
      await device.save();
    }

    // 4. Generate a device token (JWT).
    const payload = {
      sub: device._id.toString(),
      businessId: device.businessId,
    };
    const deviceToken = this.jwtService.sign(payload);

    return {
      deviceToken,
      branding: cloudResponse.branding,
    };
  }

  /**
   * Simulates a call to the Whiz Cloud Portal to verify an API key.
   * In a real application, this would be an HTTP request.
   * @param apiKey The API key to verify.
   * @returns A promise that resolves with the business information if the key is valid.
   */
  private async verifyApiKeyWithCloud(
    apiKey: string,
  ): Promise<CloudVerificationResponse | null> {
    // For now, we'll use a hardcoded test key.
    const TEST_API_KEY = 'WHIZ-TEST-KEY';
    const TEST_BUSINESS_ID = '60d5ec49c69e2c001f0b8e9a'; // Example MongoDB ObjectId

    if (apiKey === TEST_API_KEY) {
      return {
        businessId: TEST_BUSINESS_ID,
        branding: {
          primaryColor: '#0047FF', // Royal Blue
          secondaryColor: '#FFD700', // Gold
        },
      };
    }

    return null;
  }
}
