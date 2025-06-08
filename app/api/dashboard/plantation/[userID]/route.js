import { NextResponse } from 'next/server';
import User from '@/server/models/user.model.js';
import connectToDatabase from '@/server/utils/mongo.js';

export async function POST(req, { params }) {
  await connectToDatabase();
  const { userID } = params;

  try {
    const { tons } = await req.json();

    if (typeof tons !== 'number' || tons < 0) {
      return NextResponse.json({ error: 'Invalid or missing `tons` value' }, { status: 400 });
    }

    const carbonToDeduct = tons * 100;

    const user = await User.findById(userID);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize user carbonCredits if not already set
    if (typeof user.carbonCredits !== 'number') {
      user.carbonCredits = 200 * 100; // 20,000 credits by default
    }

    // Subtract credits
    user.carbonCredits = Math.max(user.carbonCredits - carbonToDeduct, 0);

    // Optional: log the emission record
    user.emissions.push({
      tonsReported: tons,
      creditsUsed: carbonToDeduct,
      timestamp: new Date(),
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Carbon credits updated after emission',
      creditsDeducted: carbonToDeduct,
      remainingCredits: user.carbonCredits,
    });

  } catch (err) {
    console.error('POST /cronjob/[userID] error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
