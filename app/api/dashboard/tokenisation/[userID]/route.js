import { NextResponse } from 'next/server';
import connectToDatabase from '@/server/utils/mongo';
import User from '@/server/models/user.model';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini evaluates authenticity & credits
async function evaluateCertificate(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are an expert validator working with AVCA to verify carbon credit certificates.
Your tasks are:
1. Check if the OCR-extracted text is from a genuine carbon credit certificate.
2. Extract the total number of certified carbon credits.

Return only this JSON:
{
  "confidence": float (0 to 1),
  "reason": "short explanation",
  "carbonCredits": number
}

OCR Text:
"""
${text}
"""`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = await response.text();

  try {
    return JSON.parse(content);
  } catch {
    return { confidence: 0.0, reason: "Gemini output malformed", carbonCredits: 0 };
  }
}

export async function POST(req, { params }) {
  await connectToDatabase();
  const { userID } = await params;

  try {
    const { text, source = "Unknown" } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: 'Missing or invalid OCR text' }, { status: 400 });
    }

    // Evaluate text using Gemini
    const { confidence, reason, carbonCredits } = await evaluateCertificate(text);
    const tokensIssued = confidence >= 0.75 ? carbonCredits * 100 : 0;

    const user = await User.findById(userID);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user token data
    user.tokenisations.push({
      carbonCredits,
      tokensIssued,
      source,
      issuedAt: new Date(),
    });

    user.trackingPurchased = true;
    user.carbonCredits += tokensIssued;

    await user.save();

    return NextResponse.json({
      success: true,
      confidence,
      reason,
      carbonCredits,
      tokensIssued,
      addedToDB: confidence >= 0.75,
    });

  } catch (err) {
    console.error("POST /dashboard/tokenise error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  await connectToDatabase();
  const { userID } = await params;

  if (!userID) {
    return NextResponse.json({ error: 'Missing userID' }, { status: 400 });
  }

  try {
    const user = await User.findById(userID).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      trackingPurchased: user.trackingPurchased,
      tokenisations: user.tokenisations || [],
      carbonCredits: user.carbonCredits,
    });
  } catch (err) {
    console.error("GET /dashboard/tokenise error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
