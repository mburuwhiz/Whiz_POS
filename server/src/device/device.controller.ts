import { Controller, Post, Body } from '@nestjs/common';
import { DeviceService } from './device.service';
import { LinkDeviceDto } from './dto/link-device.dto';

@Controller('device')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @Post('link')
  linkDevice(@Body() linkDeviceDto: LinkDeviceDto) {
    // The actual linking logic will be handled by the service.
    // We will implement that in the next step.
    return this.deviceService.linkDevice(linkDeviceDto);
  }
}
