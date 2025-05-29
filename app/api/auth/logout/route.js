export async function POST(req) {
  // Perform any server-side logout logic here (e.g., invalidate session/token in DB)
  
  return new Response(JSON.stringify({ success: true, message: 'Logged out successfully' }), {
    status: 200,
    headers: {
      // Clear the token cookie
      'Set-Cookie': 'token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      'Content-Type': 'application/json',
    },
  });
}
