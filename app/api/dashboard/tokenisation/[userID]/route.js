import { NextResponse } from 'next/server';
import connectToDatabase from '@/server/utils/mongo';
import User from '@/server/models/user.model';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buyCodi } from '@/server/utils/erc20.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Gemini evaluates authenticity & credits
async function evaluateCertificate(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are an expert validator working with AVCA to verify carbon credit certificates.

Your tasks are:
1. Check if the OCR-extracted text is from a genuine carbon credit certificate.
2. Extract the total number of certified carbon credits.
3. Carbon Credits is the number of credits issued by the government to the company. It's basically the amount of metric tons of CO2 emitable by the industry.

Return only this JSON:
{
  "confidence": float (0 to 1),
  "reason": "short explanation",
  "carbonCredits": carbonCredits * 100
}

OCR Text:
"""
${text}
"""`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = await response.text();

  console.log("Raw Gemini output:\n", content);

  try {
    const match = content.match(/\{[^}]+\}/s);
    if (!match) throw new Error("No JSON found");

    const parsed = JSON.parse(match[0]);
    return parsed;
  } catch (e) {
    console.error("Error parsing Gemini output:", e.message);
    return {
      confidence: 0.0,
      reason: "Gemini output malformed",
      carbonCredits: 0
    };
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

    const user = await User.findById(userID);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { confidence, reason, carbonCredits: rawCredits } = await evaluateCertificate(text);

    // 🛠 FIX: Schema says tokensIssued must be carbonCredits * 100
    const carbonCredits = rawCredits / 100;
    const tokensIssued = rawCredits;

    let addedToDB = false;

    if (confidence >= 0.75) {
      user.carbonCredits = tokensIssued;

      user.tokenisations.push({
        carbonCredits,
        tokensIssued,
        source,
        issuedAt: new Date(),
      });

      user.trackingPurchased = true;

      console.log("Preparing to call buyCodi...");
      const txResult = await buyCodi(user.walletID, tokensIssued);
      console.log("buyCodi result:", txResult);

      if (!txResult) {
        return NextResponse.json({ error: 'Token transfer failed' }, { status: 500 });
      }

      addedToDB = true;
    }

    await user.save();
    console.log("User after save:", user);

    return NextResponse.json({
      success: true,
      confidence,
      reason,
      carbonCredits,
      tokensIssued,
      addedToDB,
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
