const { ethers } = require("ethers");

// --- RPC dan Wallet Owner ---
const RPC_URL = "https://polygon-rpc.com";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const OWNER_PRIVATE_KEY = "";
const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

// --- Konfigurasi Kontrak TBP ---
const CONTRACT_ADDRESS = "";
const abi = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view"
  }
];

async function sendTokenToUser(userAddress, amountTbp) {
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

    const decimals = await contract.decimals();
    const parsedAmount = ethers.utils.parseUnits(String(amountTbp), decimals);

    // Ambil fee dari jaringan
    const feeData = await provider.getFeeData();

    // Minimum yang stabil untuk Polygon mainnet saat congestion
    const MIN_PRIORITY_FEE = ethers.utils.parseUnits("30", "gwei"); // 30 Gwei
    const MIN_MAX_FEE = ethers.utils.parseUnits("60", "gwei"); // 60 Gwei

    const priorityFee = feeData.maxPriorityFeePerGas?.gt(MIN_PRIORITY_FEE)
      ? feeData.maxPriorityFeePerGas
      : MIN_PRIORITY_FEE;

    const maxFee = feeData.maxFeePerGas?.gt(MIN_MAX_FEE)
      ? feeData.maxFeePerGas
      : MIN_MAX_FEE;

    const gasSettings = {
      maxPriorityFeePerGas: priorityFee,
      maxFeePerGas: maxFee,
    };

    // Nonce terbaru
    const nonce = await wallet.getTransactionCount("pending");
    console.log("📌 Nonce saat ini:", nonce);
    console.log("📦 [TX] Kirim", parsedAmount.toString(), "TBP →", userAddress);

    const tx = await contract.transfer(userAddress, parsedAmount, {
      ...gasSettings,
      nonce,
    });

    console.log("🔃 TX dikirim:", tx.hash);
    console.log("⏳ Menunggu konfirmasi TX (max 60 detik)...");

    const receipt = await Promise.race([
      tx.wait(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`⚠️ Timeout: TX terlalu lama dikonfirmasi. TX Hash: ${tx.hash}`)), 60000)
      )
    ]);

    console.log("✅ TX sukses. Block:", receipt.blockNumber);
    return receipt;

  } catch (err) {
    console.error("❌ [TX ERROR]", err.message || err);
    if (err.message?.includes("Timeout")) {
      throw new Error(err.message); // tetap lempar biar bisa dilog TX hash-nya
    }
    throw err;
  }
}

module.exports = { sendTokenToUser };
