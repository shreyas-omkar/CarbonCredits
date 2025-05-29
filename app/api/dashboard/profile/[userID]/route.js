import connectToDatabase from '@/server/utils/mongo.js';
import User from '@/server/models/user.model.js';

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    params = await params;  // await params here

    const { userID } = params;

    if (!userID) {
      return new Response(JSON.stringify({ message: 'User ID is required' }), { status: 400 });
    }

    const user = await User.findById(userID).select('-password');

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(JSON.stringify({ message: 'Something went wrong' }), { status: 500 });
  }
}
