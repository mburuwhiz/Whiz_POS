import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema()
class TransactionItem {
  @Prop({ required: true })
  sku: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  qty: number;
  @Prop({ required: true })
  price: number;
}
const TransactionItemSchema = SchemaFactory.createForClass(TransactionItem);

@Schema()
class Payment {
  @Prop({ required: true, enum: ['cash', 'card', 'mobile_money'] })
  method: string;
  @Prop({ required: true })
  amount: number;
}
const PaymentSchema = SchemaFactory.createForClass(Payment);

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Business',
    required: true,
  })
  businessId: MongooseSchema.Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true })
  deviceId: MongooseSchema.Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;
  @Prop({ type: [TransactionItemSchema], required: true })
  items: TransactionItem[];
  @Prop({ required: true })
  total: number;
  @Prop({ type: [PaymentSchema], required: true })
  payments: Payment[];
  @Prop({
    required: true,
    enum: ['COMPLETED', 'VOIDED', 'PENDING'],
    default: 'COMPLETED',
  })
  status: string;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);
