import connectToDatabase from '@/server/utils/mongo.js';
import User from '@/server/models/user.model.js';
import MarketplaceListing from '@/server/models/marketplace.model.js';

export async function POST(req, { params }) {
  try {
    await connectToDatabase();

    const { userID } = params;
    const { listingId } = await req.json();

    const user = await User.findById(userID);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const listing = await MarketplaceListing.findById(listingId);
    if (!listing || listing.isSold) {
      return new Response(JSON.stringify({ error: 'Listing not available' }), { status: 400 });
    }

    // Example purchase logic: Mark listing as sold
    listing.isSold = true;
    await listing.save();

    // Optionally, update user (like deduct balance, add purchased items, etc.)

    return new Response(JSON.stringify({ message: 'Purchase successful' }), { status: 200 });
  } catch (error) {
    console.error('Error buying listing:', error);
    return new Response(JSON.stringify({ error: 'Failed to complete purchase' }), { status: 500 });
  }
}
