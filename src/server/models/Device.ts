import { Schema, model, Document } from 'mongoose';

interface IDevice extends Document {
  businessId: Schema.Types.ObjectId;
  deviceName: string;
  deviceType: 'Desktop' | 'Mobile';
  hardwareSignature: string; // Unique identifier for the device
  lastSync: Date;
}

const deviceSchema = new Schema<IDevice>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
  deviceName: { type: String, required: true },
  deviceType: { type: String, enum: ['Desktop', 'Mobile'], required: true },
  hardwareSignature: { type: String, required: true, unique: true },
  lastSync: { type: Date, default: Date.now },
});

const Device = model<IDevice>('Device', deviceSchema);

export default Device;
