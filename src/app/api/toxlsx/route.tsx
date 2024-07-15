import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PendaftaranKIR from '../../../models/PendaftaranKIR';
import * as XLSX from 'xlsx';

const uri = process.env.MONGODB_URI; // Ensure your MongoDB connection string is in the environment variables

const connectToDatabase = async () => {
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  }
};

export const GET = async (req: NextRequest) => {
  await connectToDatabase();

  try {
    const data = await PendaftaranKIR.find({}).lean();
    const transformedData = data.map(item => ({
      _id: (item._id as mongoose.Types.ObjectId).toString(), // Keep _id as is (assuming it's a string)
      name: item.name,
      phoneNumber: item.phoneNumber,
      class: item.class,
      agreement: item.agreement,
      alasan: item.alasan,
      eskul: item.eskul.join(', '), // Convert array to string
    }));


    console.log(transformedData)
    // Prepare data for xlsx
    // console.log(data)
    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pendaftaran KIR');

    // Convert workbook to buffer
    const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the xlsx file as a response
    return new NextResponse(xlsxBuffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="pendaftaran_kir.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return new NextResponse(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
};
