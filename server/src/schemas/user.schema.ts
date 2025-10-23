import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Business' })
  businessId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: [String],
    required: true,
    enum: ['SuperAdmin', 'Admin', 'Manager', 'Cashier', 'Stock Clerk'],
  })
  roles: string[];

  @Prop({ select: false })
  pinHash?: string;

  @Prop({ select: false })
  passwordHash?: string;

  @Prop({ required: true, unique: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
