import Contest from '@/models/contest';
import { connectToDatabase } from '@/utils/connectToDatabase';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  await connectToDatabase();
  const formData = await req.formData();
  const title = formData.get('title');
  const description = formData.get('description');
  const date = formData.get('date');
  const thumbnailFile = formData.get('thumbnail');

  let thumbnail = '';
  if (thumbnailFile && thumbnailFile instanceof Blob) {
    const buffer = Buffer.from(await thumbnailFile.arrayBuffer());
    thumbnail = buffer.toString('base64');
  }

  try {
    const newContest = new Contest({
      title,
      description,
      date,
      thumbnail,
    });

    await newContest.save();
    return NextResponse.json({ success: true, data: newContest }, { status: 201 });
  } catch (error) { 
    console.error(error);

    // Cast error to Error object to safely access the message property
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Handle cases where the error might not be an instance of Error
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function GET() {
  await connectToDatabase();

  try {
    const contests = await Contest.find({});
    return NextResponse.json({ success: true, data: contests }, { status: 200 });
  } catch (error) {
    console.error(error);

    // Cast error to Error object to safely access the message property
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Handle cases where the error might not be an instance of Error
    return NextResponse.json({ success: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
