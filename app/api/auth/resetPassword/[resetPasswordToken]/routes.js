import { resetPassword } from '@/server/controllers/auth.controller';
import connectToDatabase from '@/server/utils/mongo.js'


export async function POST(req, { params }) {
  await connectToDatabase();
  const body = await req.json();
  const result = await resetPassword(params.resetPasswordToken, body);
  return Response.json(result);
}
