import { NextResponse } from 'next/server';
import User from '@/server/models/user.model.js';
import connectToDatabase from '@/server/utils/mongo.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function validateReceipt(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are a Plantation Verification AI. Your job is to verify and extract structured data from raw OCR text of a plantation receipt.
This receipt is typically issued by a nursery and may contain:
    Nursery name and address
    GST number (optional but increases credibility)
    Number of saplings purchased (explicit or inferred from quantity or item lines)
    Total amount spent
    Date of purchase (optional)
Your tasks:
    Verify authenticity of the receipt:
    Check for real-world features such as GST number, nursery name, location/address, and presence of purchase items related to saplings.
    Extract the following details (even if approximate):
        nurseryName: Name of the nursery or farm.
        location: City or town where plantation happened or nursery is located.
        totalAmount: Total amount paid (₹). Try parsing the largest numeric value or "Total".
        numberOfSaplings: Estimated count of saplings purchased.
        carbonReducedTons: Estimate = numberOfSaplings * 0.1. (Assume 1 sapling = 0.1 tons CO₂ over lifetime)

Output Format (strict JSON):
{
  "nurseryName": "Green Roots Nursery",
  "location": "Tumakuru",
  "totalAmount": 2350,
  "numberOfSaplings": 20,
  "carbonReducedTons": 2.0
}

Rules:
    DO NOT explain or add commentary.
    Respond only in valid JSON (no markdown or wrapping text).
    Use heuristic assumptions or regex to extract key details when explicit values are missing.
`;

  const result = await model.generateContent(prompt + text);
  const response = await result.response;
  const textRes = await response.text();
  const jsonMatch = textRes.match(/\{[\s\S]*?\}/);

  if (!jsonMatch) {
    console.error("Gemini failed to return valid JSON:", textRes);
    return null;
  }

  return JSON.parse(jsonMatch[0]);
}

export async function POST(req, { params }) {
  await connectToDatabase();
  const { userID } = await params;

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid OCR text' }, { status: 400 });
    }

    const parsed = await validateReceipt(text);
    if (!parsed) {
      return NextResponse.json({ error: 'Gemini failed to extract data' }, { status: 400 });
    }

    const { nurseryName, location, totalAmount, numberOfSaplings, carbonReducedTons } = parsed;
    const confidence = 0.85; // optionally, override based on Gemini metadata
    const expraTokensAwarded = Math.round(carbonReducedTons * 100);

    if (confidence < 0.75 || !carbonReducedTons || carbonReducedTons <= 0) {
      return NextResponse.json({
        success: false,
        confidence,
        message: 'Low confidence or invalid carbon estimation',
      });
    }

    const user = await User.findById(userID);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.plantations.push({
      nurseryName,
      location,
      totalAmount,
      confidence,
      rawData: text,
      carbonReducedTons,
      expraTokensAwarded,
      surityLevel: "Verified",
    });

    user.saveITCoin += expraTokensAwarded;
    await user.save();

    return NextResponse.json({
      success: true,
      nurseryName,
      location,
      totalAmount,
      carbonReducedTons,
      expraTokensAwarded,
      confidence,
      message: 'Plantation receipt verified and credits awarded.',
    });

  } catch (err) {
    console.error("POST /dashboard/plantation error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  await connectToDatabase();
  const { userID } = await params;

  try {
    const user = await User.findById(userID);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ plantations: user.plantations || [] });
  } catch (err) {
    console.error("GET /dashboard/plantation error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
