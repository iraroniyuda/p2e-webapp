const { ethers } = require("ethers");

// --- Daftar endpoint fallback Polygon RPC ---
const RPC_URLS = [
  "https://polygon-rpc.com",
  "https://rpc-mainnet.maticvigil.com",
  "https://rpc.ankr.com/polygon",
  "https://polygon-bor.publicnode.com",
];
// --- Data Wallet Owner ---
const OWNER_PRIVATE_KEY = "";
const DECIMALS = 18;
const MIN_PRIORITY_FEE = ethers.utils.parseUnits("30", "gwei");
const MIN_MAX_FEE = ethers.utils.parseUnits("60", "gwei");

/**
 * Fallback send POL native coin ke address user dengan retry RPC otomatis
 * @param {string} userAddress Wallet tujuan
 * @param {string|number} amountPol Jumlah POL (dalam POL, bukan wei)
 * @returns {string} hash transaksi
 */
async function sendPolToUser(userAddress, amountPol) {
  let lastErr = null;
  for (let i = 0; i < RPC_URLS.length; i++) {
    const rpc = RPC_URLS[i];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

    try {
      const parsedAmount = ethers.utils.parseUnits(String(amountPol), DECIMALS);

      // --- Ambil data fee dari jaringan ---
      const feeData = await provider.getFeeData();
      const priorityFee = feeData.maxPriorityFeePerGas?.gt(MIN_PRIORITY_FEE)
        ? feeData.maxPriorityFeePerGas
        : MIN_PRIORITY_FEE;
      const maxFee = feeData.maxFeePerGas?.gt(MIN_MAX_FEE)
        ? feeData.maxFeePerGas
        : MIN_MAX_FEE;

      const gasSettings = {
        gasLimit: 21000,
        maxPriorityFeePerGas: priorityFee,
        maxFeePerGas: maxFee,
      };

      const nonce = await wallet.getTransactionCount("pending");
      console.log(`[POL] [${i + 1}/${RPC_URLS.length}] RPC: ${rpc}`);
      console.log(`[POL] Nonce: ${nonce} | Kirim ${amountPol} POL ke ${userAddress}`);

      const tx = await wallet.sendTransaction({
        to: userAddress,
        value: parsedAmount,
        ...gasSettings,
        nonce,
      });

      console.log(`[POL] TX dikirim: ${tx.hash}`);

      // Tunggu receipt dengan timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout: TX belum confirmed: ${tx.hash}`)), 60000)
        ),
      ]);


      console.log(`[POL] TX confirmed. Block: ${receipt.blockNumber} Hash: ${receipt.transactionHash}`);
      return receipt.transactionHash;

    } catch (err) {
      // Cek error fatal (network, timeout, rpc error, code 500xxx, -32000, -32064)
      const errMsg = err && err.message ? err.message : String(err);
      const isRpcFatal = errMsg.includes("connection error") ||
        errMsg.includes("timeout") ||
        errMsg.includes("Unavailable") ||
        errMsg.includes("Proxy error") ||
        errMsg.includes("SERVER_ERROR") ||
        errMsg.includes("-32000") ||
        errMsg.includes("-32064");

      console.error(`[POL][RPC #${i + 1}] ERROR:`, errMsg);
      lastErr = err;

      // Kalau fatal atau error koneksi, lanjut ke RPC berikutnya
      if (i < RPC_URLS.length - 1 && isRpcFatal) {
        console.warn(`[POL] Gagal RPC ${rpc}, coba endpoint selanjutnya...`);
        continue;
      }
      // Kalau error bukan koneksi (misal saldo kurang, invalid address), langsung throw
      throw err;
    }
  }
  // Kalau semua gagal, throw error terakhir
  throw lastErr || new Error("Gagal kirim POL (semua RPC gagal)");
}

module.exports = { sendPolToUser };
