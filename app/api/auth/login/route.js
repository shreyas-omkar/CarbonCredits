import connectToDatabase from '@/server/utils/mongo.js'
import User from '@/server/models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookies } from '@/server/utils/generateTokenAndSetCookie';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ message: "User does not exist. Please register." }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ message: "Invalid password. Please try again." }, { status: 400 });
    }

    await User.findByIdAndUpdate(user._id, { $set: { lastLoggedIn: Date.now() } });

    // Create the response with both message and userId in JSON body
    const response = Response.json(
      { message: "User logged in successfully", userId: user._id.toString() }, 
      { status: 200 }
    );

    // Set the token cookie in response headers
    await generateTokenAndSetCookies(response, user._id);

    // Return the full response with cookie headers and JSON body
    return response;

  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ message: "Something went wrong." }, { status: 500 });
  }
}
