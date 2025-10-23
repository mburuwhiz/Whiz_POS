export class LinkDeviceDto {
  apiKey: string;
  fingerprint: string;
  deviceType: 'desktop' | 'mobile';
}
