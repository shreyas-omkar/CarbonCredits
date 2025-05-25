import { register } from '@/server/controllers/auth.controller';
import connectToDatabase from '@/server/utils/mongo.js'


export async function POST(req) {
    await connectToDatabase();
  const body = await req.json();
  const result = await register(body);
  return Response.json(result);
}
