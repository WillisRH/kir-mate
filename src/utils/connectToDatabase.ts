import mongoose from "mongoose";

export const connectToDatabase = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }
  
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB');
    }
  };