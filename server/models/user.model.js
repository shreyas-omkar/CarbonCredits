import mongoose from "mongoose";

// --- Transactions (Original Logic) ---
const transactionItemSchema = new mongoose.Schema({
  item: { type: String, required: true },     // e.g., "Food delivery"
  amount: { type: Number, required: true },
  time: { type: String, required: true },
});

const transactionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  needs: [transactionItemSchema],
  wants: [transactionItemSchema],
});

// --- Tokenisation Events ---
const tokenisationSchema = new mongoose.Schema({
  carbonCredits: { type: Number, required: true }, // e.g., 500
  tokensIssued: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value * 100 === this.carbonCredits;
      },
      message: "tokensIssued must be carbonCredits / 100"
    }
  },
  source: { type: String }, // e.g., "Plantation", "Trade", etc.
  issuedAt: { type: Date, default: Date.now }
});

// --- Plantation Tracking ---
const plantationSchema = new mongoose.Schema({
  location: { type: String, required: true },
  sizeInAcres: { type: Number, required: true },
  surityLevel: {
    type: String,
    enum: ["Low", "Medium", "High", "Verified"],
    default: "Low"
  },
  rawData: { // 🔹 Single OCR dump
    type: String,
    required: true,
  },
  expraTokensAwarded: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// --- User Schema ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  carbonCredits: { type: Number, default: 0 },
  walletID: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastLoggedIn: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  trackingPurchased: {type: Boolean, default: false},
  verificationTokenExpiration: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordTokenExpiration: { type: Date },
  resetPasswordOTP: { type: String },

  // 👇 Original structured transactions
  transactions: [transactionSchema],

  // 👇 Simple income/expense tracker
  newTransactions: [{
    category: String,
    amount: Number,
    type: {
      type: String,
      enum: ["income", "expense"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: String,
  }],

  // 👇 Reference to marketplace listings by the user
  marketplaceListings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketplaceListing',
  }],

  tokenisations: [tokenisationSchema],
  plantations: [plantationSchema],
});

// Prevent OverwriteModelError by reusing existing model
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
