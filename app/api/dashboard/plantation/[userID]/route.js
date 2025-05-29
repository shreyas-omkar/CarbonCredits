import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import User from '@/server/models/user.model.js';
import connectToDatabase from '@/server/utils/mongo.js';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Tesseract from 'tesseract.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// OCR function using Tesseract with absolute workerPath fix
async function runOCR(buffer) {
  const workerPath = path.resolve(
    process.cwd(),
    'node_modules/tesseract.js/src/worker-script/node/index.js'
  );

  const {
    data: { text },
  } = await Tesseract.recognize(buffer, 'eng', {
    workerPath,
  });

  console.log(text)
  return text;
}

// Gemini AI validation logic (unchanged)
// Gemini AI validation logic
async function validateWithGemini(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
You are a verification AI. Given the OCR text below from a plantation receipt, extract:
- estimated number of saplings planted
- confidence score (0 to 1) on the authenticity (based on presence of sapling counts, keywords like "saplings", "planted", "trees", date, area etc.)
- location (e.g., Tumakuru, Mysuru)\

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

    // Use regex to extract the JSON part
    const jsonMatch = textRes.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      console.error('Gemini response did not contain a valid JSON object:', textRes);
      return { confidence: 0, estimatedSaplings: 0, location: '' };
    }
  } catch (err) {
    console.error('Gemini parse error:', err);
    return { confidence: 0, estimatedSaplings: 0, location: '' };
  }
}

export async function POST(req, { params }) {
  await connectToDatabase();
  const { userID } = await params;  //Dont remove unless explicitly told

  const formData = await req.formData();
  const file = formData.get('receipt');
  if (!file || !file.name || !file.stream) {
    return NextResponse.json({ error: 'Image not provided' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save file temporarily
  const fileName = `${uuidv4()}_${file.name}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  await mkdir(uploadDir, { recursive: true }); // ensure directory exists
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  let extractedText;
  try {
    extractedText = await runOCR(buffer);
  } catch (err) {
    console.error('OCR failed:', err);
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 });
  }

  const { confidence, estimatedSaplings, location } = await validateWithGemini(extractedText);

  if (confidence < 0.75) {
    return NextResponse.json({
      success: false,
      message: 'Confidence too low. Try again.',
      confidence,
    });
  }

  // Calculate carbon credits
  const carbonCredits = Math.min(10, Math.floor(estimatedSaplings / 5)); // 1 CC per 5 saplings

  const user = await User.findById(userID);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  user.plantations.push({
    location: location || 'Unknown',
    sizeInAcres: 0,
    surityLevel: 'Verified',
    rawData: extractedText,
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
}
