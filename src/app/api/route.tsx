import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import PendaftaranKIR from '../../models/PendaftaranKIR';
import axios from 'axios';
import { connectToDatabase } from '@/utils/connectToDatabase';

const uri = process.env.MONGODB_URI; // Ensure your MongoDB connection string is in the environment variables
const waapi = process.env.NEXT_PUBLIC_API_LINK;



// const transformPhoneNumber = (phoneNumber: string): string => {
//   if (phoneNumber.startsWith('0')) {
//     return '62' + phoneNumber.slice(1);
//   }
//   return phoneNumber;
// };

const transformPhoneNumber = (phoneNumber: string): string => {
  // Remove non-numeric characters and spaces
  const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');

  // Add '62' if the number starts with '8'
  if (cleanedPhoneNumber.startsWith('8')) {
    return `628${cleanedPhoneNumber.slice(1)}`;
  }

  return cleanedPhoneNumber;
};


export const POST = async (req: NextRequest) => {
  await connectToDatabase();
  const jsonData = await req.json();

  try {
    console.log(jsonData);
    const { name, phoneNumber, class: studentClass, agreement, alasan, eskul } = jsonData;

    if (!name || !phoneNumber || !studentClass || !agreement || !alasan || !eskul) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const nama = name.toUpperCase();
    const transformedPhoneNumber = transformPhoneNumber(phoneNumber);

    // Asynchronously call the external API, but don't block the main flow if it fails
    axios.post(`${waapi}/addgroup?phoneNumber=${transformedPhoneNumber}&name=${nama}`)
      .catch(err => {
        console.error('Error calling waapi:', err);
      });

    const newPendaftaranKIR = new PendaftaranKIR({
      name: nama,
      phoneNumber: transformedPhoneNumber,
      class: studentClass,
      agreement,
      alasan,
      eskul
    });

    await newPendaftaranKIR.save();

    return NextResponse.json({ newPendaftaranKIR }, { status: 201 });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
};

export const GET = async () => {
  await connectToDatabase();

  try {
    const data = await PendaftaranKIR.find({});
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
};
