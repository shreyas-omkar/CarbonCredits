import { NextResponse } from 'next/server';
import connectToDatabase from '@/server/utils/mongo.js';
import User from '@/server/models/user.model.js';

export async function POST(req) {
  await connectToDatabase();

  try {
    const { userID } = await req.json();

    if (!userID) {
      return NextResponse.json({ error: 'Missing userID' }, { status: 400 });
    }

    const user = await User.findById(userID).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Dashboard User Fetch Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
