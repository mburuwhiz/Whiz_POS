import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    // Select the password and pin hashes as they are not selected by default
    return this.userModel.findOne({ email }).select('+passwordHash +pinHash').exec();
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.userModel.findById(id).select('+passwordHash +pinHash').exec();
  }
}
