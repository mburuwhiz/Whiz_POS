import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Business } from '../../../shared/models/Business';
import { User } from '../../../shared/models/User';
import { UsersService } from '../users/users.service';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectModel('Business') private readonly businessModel: Model<Business>,
    private readonly usersService: UsersService,
  ) {}

  async createBusinessWithAdmin(businessDto: any): Promise<Business> {
    const adminUser = await this.usersService.createUser({
      name: businessDto.adminName,
      email: businessDto.adminEmail,
      pinHash: businessDto.adminPin, // Will be hashed by the pre-save hook
      roles: ['Admin'],
      businessId: 'pending', // Temporary ID, will be updated
    });

    const newBusiness = new this.businessModel({
      name: businessDto.businessName,
      region: businessDto.region,
      adminUserId: adminUser._id,
    });

    // Assign the new businessId to the admin user
    adminUser.businessId = newBusiness._id.toString();
    await (adminUser as any).save();

    await newBusiness.save();
    return newBusiness;
  }

  async findAll(): Promise<Business[]> {
    return this.businessModel.find().exec();
  }

  async findBusinessById(id: string): Promise<Business> {
    return this.businessModel.findById(id).exec();
  }

  async issueApiKey(businessId: string): Promise<Business> {
    const business = await this.findBusinessById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const apiKey = `WHIZ-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
    business.apiKeys.push({
      key: apiKey,
      status: 'Inactive',
      issuedAt: new Date(),
    });

    await (business as any).save();
    return business;
  }

  async activateApiKey(businessId: string, key: string): Promise<Business> {
    const business = await this.findBusinessById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const apiKey = business.apiKeys.find(k => k.key === key);
    if (!apiKey) {
      throw new Error('API Key not found');
    }

    apiKey.status = 'Active';
    await (business as any).save();
    return business;
  }
}
