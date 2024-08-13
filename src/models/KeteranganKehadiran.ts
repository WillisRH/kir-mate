// src/models/KeteranganKehadiran.ts

import mongoose, { Schema, Document, model } from "mongoose";

export interface IKeteranganKehadiran extends Document {
  name: string;
  userId?: mongoose.Types.ObjectId;
  status: {
    izin: boolean;
    sakit: boolean;
  };
  keterangan: string;
  submittedAt: Date;
}

const KeteranganKehadiranSchema: Schema = new Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User" },
  status: {
    izin: { type: Boolean, required: true },
    sakit: { type: Boolean, required: true },
  },
  keterangan: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export const KeteranganKehadiran = mongoose.models.KeteranganKehadiran || model<IKeteranganKehadiran>("KeteranganKehadiran", KeteranganKehadiranSchema);
