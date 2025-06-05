import { NextResponse } from 'next/server';
import User from '@/server/models/user.model.js';
import connectToDatabase from '@/server/utils/mongo.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function validateWithGemini(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are a verification AI. Given the OCR text below from a plantation receipt, extract:
- estimated number of saplings planted
- confidence score (0 to 1) on the authenticity (based on presence of sapling counts, keywords like "saplings", "planted", "trees", date, area etc.)
- location (e.g., Tumakuru, Mysuru)

Use regex or heuristic parsing to estimate saplings.
Respond strictly in JSON format:

{
  "confidence": 0.92,
  "estimatedSaplings": 47,
  "location": "Tumakuru"
}

OCR TEXT:
"""
${text}
"""
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textRes = await response.text();

    const jsonMatch = textRes.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.error('Gemini response did not contain valid JSON:', textRes);
      return { confidence: 0, estimatedSaplings: 0, location: '' };
    }
  } catch (err) {
    console.error('Gemini parse error:', err);
    return { confidence: 0, estimatedSaplings: 0, location: '' };
  }
}

export async function POST(req, { params }) {
  await connectToDatabase();
  const { userID } = await params;

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid OCR text' }, { status: 400 });
    }

    const { confidence, estimatedSaplings, location } = await validateWithGemini(text);

    if (confidence < 0.75) {
      return NextResponse.json({
        success: false,
        message: 'Confidence too low. Try again.',
        confidence,
      });
    }

    const carbonCredits = Math.min(10, Math.floor(estimatedSaplings / 5)); // 1 CC per 5 saplings

    const user = await User.findById(userID);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.plantations.push({
      location: location || 'Unknown',
      sizeInAcres: 0,
      surityLevel: 'Verified',
      rawData: text,
      expraTokensAwarded: carbonCredits,
    });

    user.saveITCoin += carbonCredits;
    await user.save();

    return NextResponse.json({
      success: true,
      confidence,
      estimatedSaplings,
      location,
      carbonCredits,
      message: 'Verified and awarded carbon credits',
    });

  } catch (err) {
    console.error("POST /dashboard/plantation error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
