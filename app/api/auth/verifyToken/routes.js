import { verifyToken } from '@/server/middlewares/verifyToken';
import connectToDatabase from '@/server/utils/mongo.js'


export async function POST(req) {
    await connectToDatabase();
  const user = await verifyToken(req);
  if (!user) return Response.json({ success: false }, { status: 401 });
  return Response.json({ success: true, user });
}
