import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class LinkDeviceDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @IsEnum(['desktop', 'mobile'])
  deviceType: 'desktop' | 'mobile';
}
