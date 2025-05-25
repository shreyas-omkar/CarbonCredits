import { checkAuth } from '@/server/controllers/auth.controller';
import { verifyToken } from '@/server/middlewares/verifyToken';
import connectToDatabase from '@/server/utils/mongo.js'

export async function GET(req) {
  await connectToDatabase();
  const user = await verifyToken(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await checkAuth(user);
  return Response.json(result);
}
