import { sendWelcomeEmail } from '@/server/sendgrid/sendgrid.controller';
import connectToDatabase from '@/server/utils/mongo.js';
import User from "@/server/models/user.model.js"; 
export async function POST(req) {
  try {
    await connectToDatabase();

    const { verificationToken } = await req.json();
    if (!verificationToken) {
      return Response.json({ msg: "Verification token missing" }, { status: 400 });
    }

    const veriString = verificationToken.toString();

    const user = await User.findOne({
      verificationToken: veriString,
      verificationTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return Response.json({ msg: "Invalid or Expired Verification Code" }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiration = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.fullname, user.username);

    return Response.json({ msg: "Email verified and welcome email sent" }, { status: 200 });

  } catch (error) {
    console.error("Verification error:", error);
    return Response.json({ msg: "Couldn't verify email", error: error.message }, { status: 500 });
  }
}
