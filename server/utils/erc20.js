import { createThirdwebClient, getContract, readContract,prepareContractCall, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { isAddress, parseUnits } from "viem";
import { privateKeyToAccount } from "thirdweb/wallets";
import dotenv from "dotenv";

dotenv.config();

const client = createThirdwebClient({
  secretKey: process.env.SECRET_KEY,
});

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "transferFrom",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
];

let codiContract;

const loadContract = async () => {
  if (!codiContract) {
    console.log("⏳ Loading CC contract...");
    codiContract = await getContract({
      client,
      chain: defineChain(80002), // Polygon Amoy
      address: process.env.CONTRACT_ADDRESS,
      abi: ERC20_ABI,
    });
    console.log("✅ CC Contract loaded");
  }
  return codiContract;
};

// ✅ Get balance using ABI method call
export const getBalance = async (account) => {
  try {
    // Ensure account is a string and trim it
    const sanitized = String(account).trim();
    if (!isAddress(sanitized)) throw new Error(`Invalid address: ${sanitized}`);

    const contract = await loadContract();

    const balance = await readContract({
      contract,
      method: "balanceOf",
      params: [sanitized],
    });

    const decimals = await readContract({
      contract,
      method: "decimals",
      params: [],
    });

    const displayBalance = Number(balance) / 10 ** Number(decimals);
    console.log(`💰 ${displayBalance} CC`);
    return displayBalance;
  } catch (err) {
    console.error("❌ Error fetching balance:", err);
    return "0";
  }
};

const account = privateKeyToAccount({
  client,
  privateKey: process.env.PRIVATE_KEY, // 🔐 Add this to your .env
});

export const buyCodi = async (to, amount) => {
  try {
    const sanitizedTo = to.trim();
    if (!isAddress(sanitizedTo)) throw new Error(`Invalid recipient: ${sanitizedTo}`);

    const contract = await loadContract();

    const decimals = await readContract({
      contract,
      method: "decimals",
      params: [],
    });

    const amountInWei = parseUnits(amount.toString(), decimals);

    const txRequest = prepareContractCall({
      contract,
      method: "transfer",
      params: [sanitizedTo, amountInWei],
    });

    const txResult = await sendTransaction({
      transaction: txRequest,
      account, // 🔥 This signs the transaction
    });

    console.log(`✅ Sent ${amount} CC to ${sanitizedTo}`);
    return txResult;
  } catch (err) {
    console.error("❌ Error sending CC:", err);
    return null;
  }
};