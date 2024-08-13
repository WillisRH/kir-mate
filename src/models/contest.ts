// src/models/contest.js
import mongoose from 'mongoose';

const ContestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '', // Default to an empty string if no thumbnail is provided
  },
});

export default mongoose.models.Contest || mongoose.model('Contest', ContestSchema);
