import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device } from '../../../shared/models/Device';

@Injectable()
export class DevicesService {
  constructor(@InjectModel('Device') private readonly deviceModel: Model<Device>) {}

  async create(device: Partial<Device>): Promise<Device> {
    const newDevice = new this.deviceModel(device);
    return newDevice.save();
  }
}
