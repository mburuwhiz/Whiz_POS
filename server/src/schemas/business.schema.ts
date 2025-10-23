import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type BusinessDocument = Business & Document;

@Schema({ timestamps: true })
class ApiKey {
  @Prop({ required: true })
  key: string;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  issuedAt: Date;
}

const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

@Schema({ timestamps: true })
class BusinessConfig {
  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  taxRate: number;
}

const BusinessConfigSchema = SchemaFactory.createForClass(BusinessConfig);

@Schema({ timestamps: true })
export class Business {
  @Prop({ required: true })
  name: string;

  @Prop()
  region: string;

  @Prop({ type: [ApiKeySchema], select: false })
  apiKeys: ApiKey[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  adminUserId: MongooseSchema.Types.ObjectId;

  @Prop({ type: BusinessConfigSchema })
  config: BusinessConfig;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
