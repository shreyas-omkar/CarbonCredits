
import connectToDatabase from '@/server/utils/mongo.js';
import User from '@/server/models/user.model';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/server/sendgrid/sendgrid.controller';
import { generateTokenAndSetCookies } from '@/server/utils/generateTokenAndSetCookie';

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { username, fullname, email, password, age, mmwid } = body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ success: false, message: 'User already exists.' }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      username,
      fullname,
      email,
      password: hashedPassword,
      age,
      walletID: mmwid,
      verificationToken,
      verificationTokenExpiration: Date.now() + 24 * 60 * 60 * 1000,
      lastLoggedIn: Date.now(),
    });

    await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    // Generate JWT token & set cookie (inside server context)
    await generateTokenAndSetCookies(newUser._id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User registered successfully',
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('[Register Error]', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error. Please try again later.' }),
      { status: 500 }
    );
  }
}
