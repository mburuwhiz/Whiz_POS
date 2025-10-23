import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DeviceDocument = Device & Document;

@Schema({ timestamps: true })
export class Device {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Business',
    required: true,
  })
  businessId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true, select: false })
  fingerprint: string;

  @Prop()
  lastSeen: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
