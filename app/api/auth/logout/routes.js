import { logout } from '@/server/controllers/auth.controller';

export async function POST(req) {
  const body = await req.json();
  const result = await logout(body);
  return Response.json(result);
}
