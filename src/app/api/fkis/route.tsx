// src/app/api/fkis/route.tsx

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { KeteranganKehadiran } from "@/models/KeteranganKehadiran";
import { connectToDatabase } from "@/utils/connectToDatabase";


export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name, userId, izin, sakit, keterangan } = body;

    console.log(body);

    // Validate input
    if (!name || !keterangan || (izin === undefined && sakit === undefined)) {
      return NextResponse.json(
        { message: "All required fields must be filled." },
        { status: 400 }
      );
    }

    // Validate ObjectId
    const isValidObjectId = mongoose.isValidObjectId(userId);
    
    // Prepare the data to save
    const newEntryData: any = {
      name,
      status: {
        izin: !!izin,
        sakit: !!sakit,
      },
      keterangan,
    };

    // Include userId only if it is valid
    if (isValidObjectId) {
      newEntryData.userId = new mongoose.Types.ObjectId(userId);
    }

    // Create a new document in the collection
    const newEntry = new KeteranganKehadiran(newEntryData);
    await newEntry.save();

    return NextResponse.json(
      { message: "Data submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
