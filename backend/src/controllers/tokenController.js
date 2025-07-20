const { ethers } = require("ethers");

const CONTRACT_ADDRESS = "";

const PRIVATE_KEY = "";
const RPC_URL = "https://polygon-rpc.com";
//const RPC_URL = "https://ethereum-sepolia.publicnode.com"; //Testnet

const abi = require("../abi/tokenAbi.json");
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
const TbpStakingConfig = require("../models/TbpStakingConfig");


// 🪙 Mint TBPT
const mintTbp = async (req, res) => {
  const { toAddress, amountTbp } = req.body;
  try {
    if (!ethers.utils.isAddress(toAddress)) {
      return res.status(400).json({ error: "Alamat wallet tidak valid." });
    }
    const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);
    const tx = await contract.mint(toAddress, amount);
    const receipt = await tx.wait();
    res.json({ message: "✅ Mint berhasil", txHash: receipt.transactionHash });
  } catch (err) {
    console.error("❌ Mint gagal:", err);
    res.status(500).json({ error: "Mint gagal" });
  }
};

// 💸 Transfer TBPT
const transferTbp = async (req, res) => {
  const { toAddress, amountTbp } = req.body;
  try {
    if (!ethers.utils.isAddress(toAddress)) {
      return res.status(400).json({ error: "Alamat wallet tidak valid." });
    }
    const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);
    const tx = await contract.transfer(toAddress, amount);
    const receipt = await tx.wait();
    res.json({ message: "✅ Transfer berhasil", txHash: receipt.transactionHash });
  } catch (err) {
    console.error("❌ Transfer gagal:", err);
    res.status(500).json({ error: "Transfer gagal" });
  }
};

// 🔥 Burn TBPT
const burnTbp = async (req, res) => {
  const { amountTbp } = req.body;
  try {
    const amount = ethers.utils.parseUnits(amountTbp.toString(), 18);
    const tx = await contract.burn(amount);
    const receipt = await tx.wait();
    res.json({ message: "🔥 Burn berhasil", txHash: receipt.transactionHash });
  } catch (err) {
    console.error("❌ Burn gagal:", err);
    res.status(500).json({ error: "Burn gagal" });
  }
};

// 🔒 Kunci P2P
const lockP2P = async (req, res) => {
  try {
    const gasOption = await getPolygonGasOption(); // Tambah opsi gas

    const tx = await contract.disableP2PTransfer(gasOption); // Kirim tx

    // Tunggu receipt max 60 detik, kalau lebih return txHash saja
    try {
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 60000)
        ),
      ]);
      res.json({ message: "✅ P2P dikunci", txHash: receipt.transactionHash });
    } catch (timeoutErr) {
      res.json({
        message: "⏳ Transaksi dikirim, tapi belum selesai",
        txHash: tx.hash,
      });
    }
  } catch (err) {
    console.error("❌ Gagal lock P2P:", err);
    res.status(500).json({
      error: "Lock P2P gagal",
      detail: err.message || err.toString(),
    });
  }
};

// 🔓 Buka P2P
const unlockP2P = async (req, res) => {
  try {
    const gasOption = await getPolygonGasOption(); // Tambah opsi gas

    const tx = await contract.enableP2PTransfer(gasOption); // Kirim tx

    // Tunggu receipt max 15 detik, kalau lebih return txHash saja
    try {
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 60000)
        ),
      ]);
      res.json({ message: "✅ P2P dibuka", txHash: receipt.transactionHash });
    } catch (timeoutErr) {
      res.json({
        message: "⏳ Transaksi dikirim, tapi belum selesai",
        txHash: tx.hash,
      });
    }
  } catch (err) {
    console.error("❌ Gagal unlock P2P:", err);
    res.status(500).json({
      error: "Unlock P2P gagal",
      detail: err.message || err.toString(),
    });
  }
};



// === Helper fee logic ===
const getPolygonGasOption = async () => {
  const feeData = await provider.getFeeData();
  const MIN_PRIORITY_FEE = ethers.utils.parseUnits("30", "gwei");
  const MIN_MAX_FEE = ethers.utils.parseUnits("60", "gwei");
  return {
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.gt(MIN_PRIORITY_FEE)
      ? feeData.maxPriorityFeePerGas : MIN_PRIORITY_FEE,
    maxFeePerGas: feeData.maxFeePerGas?.gt(MIN_MAX_FEE)
      ? feeData.maxFeePerGas : MIN_MAX_FEE,
  };
};

// --- Setter Reward Rate ---
const setRewardRate = async (req, res) => {
  const { rewardRate } = req.body;
  if (!rewardRate) return res.status(400).json({ error: "Nilai rewardRate dibutuhkan" });
  try {
    const gasOption = await getPolygonGasOption();
    const tx = await contract.setRewardRate(rewardRate, gasOption);
    await tx.wait();

    // UP SERT ke id=1
    let config = await TbpStakingConfig.findByPk(1);
    if (config) {
      await config.update({ rewardRate });
    } else {
      await TbpStakingConfig.create({ id: 1, rewardRate });
    }

    res.json({ message: "Reward rate berhasil diubah", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengatur reward rate", detail: err.message });
  }
};

// --- Setter Minimum Stake Time ---
const setMinimumStakeTime = async (req, res) => {
  const { minStakeTime } = req.body;
  if (!minStakeTime) return res.status(400).json({ error: "Nilai minStakeTime dibutuhkan" });
  try {
    const gasOption = await getPolygonGasOption();
    const tx = await contract.setMinimumStakeTime(minStakeTime, gasOption);
    await tx.wait();

    let config = await TbpStakingConfig.findByPk(1);
    if (config) {
      await config.update({ minStakeTime });
    } else {
      await TbpStakingConfig.create({ id: 1, minStakeTime });
    }

    res.json({ message: "Minimum stake time berhasil diubah", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengatur minimum stake time", detail: err.message });
  }
};

// --- Setter Staking Cap ---
const setStakingCap = async (req, res) => {
  const { stakeCap } = req.body;
  if (!stakeCap) return res.status(400).json({ error: "Nilai stakeCap dibutuhkan" });
  try {
    const gasOption = await getPolygonGasOption();
    const tx = await contract.setStakingCap(stakeCap, gasOption);
    await tx.wait();

    let config = await TbpStakingConfig.findByPk(1);
    if (config) {
      await config.update({ stakingCap: stakeCap });
    } else {
      await TbpStakingConfig.create({ id: 1, stakingCap: stakeCap });
    }

    res.json({ message: "Stake cap berhasil diubah", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengatur stake cap", detail: err.message });
  }
};

// --- GET Config: Hanya ambil id=1 ---
const getStakingConfig = async (req, res) => {
  try {
    let config = await TbpStakingConfig.findByPk(1);
    if (!config) {
      // Return default jika belum pernah di-set
      config = { rewardRate: "0", minStakeTime: 0, stakingCap: "0" };
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil config", detail: err.message });
  }
};




// Dummy handler untuk transferOwnership (jika belum ada)
const transferOwnership = async (req, res) => {
  const { newOwnerAddress } = req.body;
  try {
    if (!ethers.utils.isAddress(newOwnerAddress)) {
      return res.status(400).json({ error: "Alamat tidak valid" });
    }
    const tx = await contract.transferOwnership(newOwnerAddress);
    const receipt = await tx.wait();
    res.json({ message: "Ownership berhasil dipindahkan", txHash: receipt.transactionHash });
  } catch (err) {
    console.error("❌ Gagal transfer ownership:", err);
    res.status(500).json({ error: "Transfer ownership gagal" });
  }
};

const getTotalSupply = async (req, res) => {
  try {
    const rawSupply = await contract.totalSupply();
    const formatted = ethers.utils.formatUnits(rawSupply, 18); // ubah ke float string
    const display = Number(formatted).toLocaleString("id-ID", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 18, // fleksibel tapi tetap presisi
    });

    res.json({ totalSupply: display + " TBPT" });
  } catch (err) {
    console.error("❌ Gagal ambil total supply:", err);
    res.status(500).json({ error: "Gagal ambil total supply" });
  }
};


// 📥 Get Token Balance
const getTokenBalance = async (req, res) => {
  const { address } = req.query;
  try {
    if (!ethers.utils.isAddress(address)) {
      return res.status(400).json({ error: "Alamat wallet tidak valid." });
    }

    const balance = await contract.balanceOf(address);
    const formatted = ethers.utils.formatUnits(balance, 18);
    res.json({ balance: formatted });
  } catch (err) {
    console.error("❌ Gagal ambil balance:", err);
    res.status(500).json({ error: "Gagal ambil saldo" });
  }
};

// 📥 Get P2P Allow Status
const getP2PAllowedStatus = async (req, res) => {
  try {
    const allowed = await contract.allowP2P();
    res.json({ allowed });
  } catch (err) {
    console.error("❌ Gagal cek status P2P:", err);
    res.status(500).json({ error: "Gagal cek status P2P" });
  }
};

const getTokenInfo = async (req, res) => {
  try {
    const address = signer.address; // wallet owner
    const balance = await contract.balanceOf(address);
    const totalSupply = await contract.totalSupply();
    const p2pAllowed = await contract.allowP2P();

    res.json({
      wallet: address,
      balance: ethers.utils.formatUnits(balance, 18),
      totalSupply: ethers.utils.formatUnits(totalSupply, 18),
      p2pAllowed,
    });
  } catch (err) {
    console.error("❌ Gagal ambil info token:", err);
    res.status(500).json({ error: "Gagal ambil info token" });
  }
};


module.exports = {
  mintTbp,
  transferTbp,
  burnTbp,
  lockP2P,
  unlockP2P,
  transferOwnership,
  setRewardRate,
  setMinimumStakeTime,
  setStakingCap,
  getTotalSupply,
  getTokenBalance,
  getP2PAllowedStatus,
  getTokenInfo,
  getStakingConfig
};
