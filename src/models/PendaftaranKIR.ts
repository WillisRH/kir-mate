import mongoose, { Schema, Document } from 'mongoose';

interface IPendaftaranKIR extends Document {
  name: string;
  phoneNumber: string;
  class: string;
  agreement: boolean;
  alasan: string; // Add alasan field
  eskul: string[]; // Add eskul field
}

const PendaftaranKIRSchema: Schema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  class: { type: String, required: true },
  agreement: { type: Boolean, required: true },
  alasan: { type: String, required: true }, // Define alasan field
  eskul: { type: [String], required: true }, // Define eskul field
});

export default mongoose.models.PendaftaranKIR || mongoose.model<IPendaftaranKIR>('PendaftaranKIR', PendaftaranKIRSchema);
