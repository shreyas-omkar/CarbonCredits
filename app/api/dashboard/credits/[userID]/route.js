// app/api/dashboard/credits/[userID]/route.ts

import { NextResponse } from "next/server";
import connectToDatabase from "@/server/utils/mongo";
import User from "@/server/models/user.model";

export async function GET(req, { params }) {
  await connectToDatabase();

  const { userID } = await params;

  try {
    const user = await User.findById(userID).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return full user data directly
    return NextResponse.json({
      success: true,
      userData: user,
    });
  } catch (err) {
    console.error("GET /dashboard/credits error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
