
import { NextResponse } from "next/server";
import connectToDatabase from "@/server/utils/mongo";
import User from "@/server/models/user.model";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  await connectToDatabase();
  const { userID } = await params;

  try {
    const user = await User.findById(userID);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rawBody = await req.text();
    if (!rawBody) {
      console.warn("ESP sent empty body");
      return NextResponse.json({ message: "No data received" }, { status: 200 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (err) {
      console.error("Invalid JSON from ESP:", err);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const credits = parseFloat(body?.credits);
    if (!credits || isNaN(credits) || credits <= 0) {
      console.warn("Invalid credits received:", body?.credits);
      return NextResponse.json({ error: "Invalid or missing 'credits'" }, { status: 400 });
    }

    const current = parseFloat(user.carbonCredits.toString());
    const updated = Math.max(0, current - credits);

    user.carbonCredits = mongoose.Types.Decimal128.fromString(updated.toFixed(9));
    user.emissions.push({
      creditsUsed: credits,
      timestamp: new Date(),
    });
    user.lastPing = new Date();
    await user.save();

    console.log(`✅ Updated user ${userID}: ${current} -> ${updated}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cronjob POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
