import mongoose from 'mongoose';

const marketplaceListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priceCC: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isSold: { type: Boolean, default: false },
}, {
  timestamps: true,  // adds createdAt, updatedAt automatically
});

const MarketplaceListing = mongoose.models.MarketplaceListing || mongoose.model('MarketplaceListing', marketplaceListingSchema);

export default MarketplaceListing;
