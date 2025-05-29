import connectToDatabase from '@/server/utils/mongo.js';
import User from '@/server/models/user.model.js';
import MarketplaceListing from '@/server/models/marketplace.model.js';

export async function POST(req, { params }) {
    try {
        await connectToDatabase();

        const { userID } = await params; // NO await here

        const body = await req.json();

        const user = await User.findById(userID);
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        const { title, quantity, priceCC, description } = body;

        if (!title || !quantity || !priceCC) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const qtyNum = Number(quantity);
        const priceNum = Number(priceCC);

        if (isNaN(qtyNum) || qtyNum <= 0 || isNaN(priceNum) || priceNum < 0) {
            return new Response(JSON.stringify({ error: 'Invalid quantity or price' }), { status: 400 });
        }

        const newListing = new MarketplaceListing({
            title,
            description: description || '',
            quantity: qtyNum,
            priceCC: priceNum,
            ownerID: user._id,
        });

        await newListing.save();

        user.marketplaceListings.push(newListing._id);
        await user.save();

        return new Response(JSON.stringify(newListing), { status: 201 });
    } catch (error) {
        console.error('Error creating listing:', error);
        return new Response(JSON.stringify({ error: 'Failed to create listing' }), { status: 500 });
    }
}

export async function GET() {
    try {
        await connectToDatabase();

        // Return only unsold listings, populate owner info
        const listings = await MarketplaceListing.find({ isSold: false }).populate('ownerID', 'username fullname');

        return new Response(JSON.stringify(listings), { status: 200 });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch listings' }), { status: 500 });
    }
}
