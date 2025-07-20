const { Op } = require("sequelize");
const { ethers } = require("ethers");
const Decimal = require("decimal.js");

const UserBalance = require("../models/UserBalance");
const SbpBalanceDetail = require("../models/SbpBalanceDetail");
const User = require("../models/User");
const SbpToTbpConversionRate = require("../models/SbpToTbpConversionRate");
const { sendTokenToUser } = require("../utils/sendTokenToUser");
const SbpToTbpHistory = require("../models/SbpToTbpHistory");
const UserActivationProgress = require("../models/UserActivationProgress");
const TbpToRupiahRateConfig = require("../models/TbpToRupiahRateConfig");
const TbpToRupiahConversionLog = require("../models/TbpToRupiahConversionLog");
const TbpBurnRateConfig = require("../models/TbpBurnRateConfig");
const TbpToRaceHistory = require("../models/TbpToRaceHistory");

const RPC_URL = "https://polygon-rpc.com";
//const RPC_URL = "https://ethereum-sepolia.publicnode.com"; //Testnet
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const CONTRACT_ADDRESS = "";

const OWNER_ADDRESS = "";
const OWNER_PRIVATE_KEY = "";
const TBP_DECIMALS = 18;
const RACE_PER_TBP = 10;
const walletOwner = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

const toDecimal = (val) => new Decimal(val || 0);

// ✅ Ambil saldo utama user
const getUserBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const [balance] = await UserBalance.findOrCreate({
      where: { userId },
      defaults: { sbp: 0, race: 0, rupiah: 0, tbp: 0, sbpForSale: 0 },
    });

    const user = await User.findByPk(userId, {
      attributes: ["exchangerLevel", "isCompanyExchanger"],
    });

    const validLevels = ["mid", "senior", "executive"];
    const level = validLevels.includes(user?.exchangerLevel)
      ? user.exchangerLevel
      : null;

    res.json({
      sbp: balance.sbp.toString(),
      race: balance.race.toString(),
      rupiah: Number(balance.rupiah),
      rupiahForSell: Number(balance.rupiahForSell),
      tbp: balance.tbp.toString(),
      claimedTbp: balance.claimedTbp.toString(),
      sbpForSale: balance.sbpForSale.toString(),
      exchangerLevel: level,
      isCompanyExchanger: !!user?.isCompanyExchanger,
    });
  } catch (err) {
    console.error("❌ Gagal ambil saldo:", err);
    res.status(500).json({ message: "Gagal ambil saldo" });
  }
};

// ✅ Ambil detail SBP + ringkasan
const getUserSbpDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const whereClause = { userId };
    if (from || to) {
      whereClause.createdAt = {};
      if (from) whereClause.createdAt[Op.gte] = new Date(from);
      if (to) whereClause.createdAt[Op.lte] = new Date(to);
    }

    const details = await SbpBalanceDetail.findAll({
      where: whereClause,
      attributes: ["source", "amount", "lockedUntil", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const now = new Date();
    let totalLocked = new Decimal(0);
    let totalUnlocked = new Decimal(0);

    for (const item of details) {
      const amount = toDecimal(item.amount);
      if (item.lockedUntil && new Date(item.lockedUntil) > now) {
        totalLocked = totalLocked.plus(amount);
      } else {
        totalUnlocked = totalUnlocked.plus(amount);
      }
    }

    res.json({
      summary: {
        totalLocked: totalLocked.toString(),
        totalUnlocked: totalUnlocked.toString(),
        total: totalLocked.plus(totalUnlocked).toString(),
      },
      details,
    });
  } catch (err) {
    console.error("❌ Gagal ambil detail SBP:", err);
    res.status(500).json({ message: "Gagal ambil detail SBP" });
  }
};

// ✅ Update jumlah SBP untuk dijual
const updateSbpForSale = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = toDecimal(req.body.amount);

    if (amount.isNegative()) {
      return res.status(400).json({ error: "Jumlah tidak valid." });
    }

    const user = await User.findByPk(userId, {
      attributes: ["exchangerLevel", "isCompanyExchanger"],
    });

    const validLevels = ["mid", "senior", "executive"];
    const isExchanger =
      validLevels.includes(user?.exchangerLevel) || user?.isCompanyExchanger === true;

    if (!isExchanger) {
      return res.status(403).json({ error: "Anda bukan exchanger." });
    }

    const [balance] = await UserBalance.findOrCreate({ where: { userId } });
    balance.sbpForSale = amount.toFixed();
    await balance.save();

    res.json({ message: "SBP untuk dijual berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Gagal update sbpForSale:", err);
    res.status(500).json({ error: "Gagal update SBP yang dijual." });
  }
};

// ✅ Klaim TBP ke wallet
const claimTbp = async (req, res) => {
  try {
    const userId = req.user.id;
    const [balance] = await UserBalance.findOrCreate({ where: { userId } });

    const amountToClaim = toDecimal(balance.tbp);
    if (amountToClaim.lte(0)) {
      return res.status(400).json({ error: "Tidak ada TBP yang bisa diklaim." });
    }

    const user = await User.findByPk(userId);
    if (!user || !user.wallet) {
      return res.status(400).json({ error: "Alamat wallet tidak ditemukan." });
    }

    await sendTokenToUser(user.wallet, amountToClaim.toFixed());

    balance.tbp = "0";
    balance.claimedTbp = toDecimal(balance.claimedTbp).plus(amountToClaim).toFixed();
    await balance.save();

    res.json({ message: `✅ Berhasil klaim ${amountToClaim.toFixed()} TBP ke ${user.wallet}` });
  } catch (err) {
    console.error("❌ Gagal klaim TBP:", err);
    res.status(500).json({ error: "Gagal klaim TBP" });
  }
};



const convertSbpToTbp = async (req, res) => {
  try {
    const userId = req.user.id;
    const sbpInput = toDecimal(req.body.sbpAmount);

    if (sbpInput.lte(0)) {
      return res.status(400).json({ error: "Jumlah SBP tidak valid." });
    }

    const [balance] = await UserBalance.findOrCreate({ where: { userId } });

    const availableSbp = toDecimal(balance.sbp).minus(balance.sbpForSale || 0);
    if (sbpInput.gt(availableSbp)) {
      return res.status(400).json({ error: "Saldo SBP tidak mencukupi." });
    }

    const user = await User.findByPk(userId);
    if (!user?.wallet) {
      return res.status(400).json({ error: "Wallet belum terhubung." });
    }

    const rate = await SbpToTbpConversionRate.findOne({
      order: [["createdAt", "DESC"]],
    });

    if (!rate) {
      return res.status(500).json({ error: "Rasio konversi belum diatur." });
    }

    const sbpRate = toDecimal(rate.sbpAmount);
    const tbpRate = toDecimal(rate.tbpAmount);
    const tbpToSend = sbpInput.mul(rate.tbpAmount).div(rate.sbpAmount);

    if (tbpToSend.lte(0)) {
      return res.status(400).json({ error: "Jumlah konversi menghasilkan 0 TBP." });
    }

    // Kirim token ke wallet user
    await sendTokenToUser(user.wallet, tbpToSend.toFixed());

    // Simpan perubahan saldo
    balance.sbp = balance.sbp.minus(sbpInput);
    balance.claimedTbp = toDecimal(balance.claimedTbp).plus(tbpToSend).toFixed();
    await balance.save();

    // Catat histori konversi
    await SbpToTbpHistory.create({
      userId,
      sbpAmount: sbpInput.toFixed(),
      tbpAmount: tbpToSend.toFixed(),
      conversionRate: `${sbpRate}:${tbpRate}`,
    });

    // ✅ Update progress aktivasi (jika ada)
    const progress = await UserActivationProgress.findOne({ where: { userId } });
    if (progress && !progress.isActivated) {
      progress.sbpToTbpDone = new Decimal(progress.sbpToTbpDone).plus(sbpInput);

      // Cek apakah kedua syarat sudah tercapai
      if (
        new Decimal(progress.sbpToTbpDone).gte(progress.requiredSBP) &&
        new Decimal(progress.tbpToRaceDone).gte(progress.requiredTBP)
      ) {
        progress.isReady = true;
      }

      await progress.save();
    }

    res.json({
      message: `✅ ${sbpInput.toFixed()} SBP berhasil dikonversi menjadi ${tbpToSend.toFixed()} TBP dan dikirim ke wallet.`,
      tbpSent: tbpToSend.toFixed(),
    });
  } catch (err) {
    console.error("❌ Gagal konversi SBP ke TBP:", err);
    res.status(500).json({ error: "Gagal konversi SBP ke TBP." });
  }
};

const requestSbpToTbp = async (req, res) => {
  try {
    const userId = req.user.id;
    const sbpInput = toDecimal(req.body.sbpAmount);

    const [balance] = await UserBalance.findOrCreate({ where: { userId } });
    const available = toDecimal(balance.sbp).minus(balance.sbpForSale || 0);
    if (sbpInput.lte(0) || sbpInput.gt(available))
      return res.status(400).json({ error: "Saldo tidak mencukupi atau input tidak valid." });

    const user = await User.findByPk(userId);
    if (!user?.wallet)
      return res.status(400).json({ error: "Wallet belum terhubung." });

    const rate = await SbpToTbpConversionRate.findOne({ order: [["createdAt", "DESC"]] });
    const tbpToSend = sbpInput.mul(rate.tbpAmount).div(rate.sbpAmount);

    balance.sbp = balance.sbp.minus(sbpInput);
    // PATCH WAJIB:
    balance.sbpForSale = Decimal.min(balance.sbpForSale, balance.sbp).toFixed();
    await balance.save();

    const history = await SbpToTbpHistory.create({
      userId,
      sbpAmount: sbpInput.toFixed(),
      tbpAmount: tbpToSend.toFixed(),
      conversionRate: `${rate.sbpAmount}:${rate.tbpAmount}`,
      status: "pending",
    });

    res.json({ historyId: history.id, message: "✅ Permintaan diterima. Silakan konfirmasi pengiriman TBP." });
  } catch (err) {
    console.error("❌ Gagal request konversi:", err);
    res.status(500).json({ error: "Gagal membuat permintaan konversi." });
  }
};

const confirmSbpToTbp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { historyId } = req.body;

    const record = await SbpToTbpHistory.findOne({ where: { id: historyId, userId } });
    if (!record || record.status !== "pending")
      return res.status(400).json({ error: "Permintaan tidak ditemukan atau sudah diproses." });

    const user = await User.findByPk(userId);
    if (!user.wallet)
      return res.status(400).json({ error: "Wallet tidak ditemukan." });

    // ✅ Kirim TBP
    let txHash = null;
    try {
      const receipt = await sendTokenToUser(user.wallet, record.tbpAmount);
      txHash = receipt.transactionHash;

      // ✅ Update balance dan histori kalau sukses
      const balance = await UserBalance.findOne({ where: { userId } });
      balance.claimedTbp = toDecimal(balance.claimedTbp).plus(record.tbpAmount).toFixed();
      await balance.save();

      record.status = "success";
      record.txHash = txHash;
      await record.save();

      // PATCH: update progress aktivasi
      const progress = await UserActivationProgress.findOne({ where: { userId } });
      if (progress && !progress.isActivated) {
        progress.sbpToTbpDone = new Decimal(progress.sbpToTbpDone).plus(record.sbpAmount);

        if (
          new Decimal(progress.sbpToTbpDone).gte(progress.requiredSBP) &&
          new Decimal(progress.tbpToRaceDone).gte(progress.requiredTBP)
        ) {
          progress.isReady = true;
        }
        await progress.save();
      }

      return res.json({ message: "✅ TBP berhasil dikirim ke wallet!", txHash });


    } catch (err) {
      // Tangkap timeout dan tetap simpan TX hash jika ada
      const match = err.message?.match(/TX Hash: (0x[a-fA-F0-9]+)/);
      txHash = match?.[1] || null;

      if (txHash) {
        record.status = "pending_confirm";
        record.txHash = txHash;
        await record.save();

        return res.status(202).json({
          message: "⏳ Transaksi dikirim, sedang menunggu konfirmasi dari jaringan.",
          txHash,
        });
      }

      throw err; // Kalau bukan karena timeout, lempar error asli
    }

  } catch (err) {
    console.error("❌ Konfirmasi konversi gagal:", err);
    return res.status(500).json({ error: "Konfirmasi gagal. Coba lagi nanti." });
  }
};


const getUserTbpBurnRule = (user, progress) => {
  if (user.userLevel === "green") return "green";
  if (user.userLevel === "blue") return "blue";
  if (user.userLevel === "double_blue") return "double_blue";
  if (progress) {
    const pkg = String(progress.packageName || "").toLowerCase();
    if (pkg.includes("green") && !progress.isActivated)
      return "activation_green_pending";
    if (pkg.includes("blue") && pkg.includes("double") && !progress.isActivated)
      return "activation_double_blue_pending";
    if (pkg.includes("blue") && !progress.isActivated)
      return "activation_blue_pending";
  }
  return "green"; // fallback
};

// ---
// PATCH: convertTbpToRace

const convertTbpToRace = async (req, res) => {
  const { amount, txHashUserToOwner } = req.body;
  const userId = req.user.id;

  try {
    if (!amount || !txHashUserToOwner) {
      return res.status(400).json({ error: "Data tidak lengkap." });
    }

    // Ambil user wallet
    const user = await User.findByPk(userId);
    if (!user?.wallet) {
      return res.status(400).json({ error: "Wallet user tidak ditemukan." });
    }

    // 1. Ambil progress aktivasi & burn rate config
    const progress = await UserActivationProgress.findOne({ where: { userId } });
    const burnRule = getUserTbpBurnRule(user, progress);
    const config = await TbpBurnRateConfig.findOne({ where: { type: burnRule } });
    console.log("🔥 [DEBUG] progress:", progress);
    console.log("🔥 [DEBUG] userLevel:", user.userLevel);
    console.log("🔥 [DEBUG] burnRule:", burnRule, "| config:", config?.burnRate);
    if (!config) return res.status(400).json({ error: "Konfigurasi burn rate belum diset." });

    const burnRate = Number(config.burnRate);
    const total = new Decimal(amount);

    const burnAmount = total.mul(burnRate).div(100);
    const ownerAmount = total.minus(burnAmount);

    // 2. Validasi transaksi transfer user -> owner (ERC20)
    const receiptUser = await provider.getTransactionReceipt(txHashUserToOwner);
    if (!receiptUser || receiptUser.status !== 1) {
      return res.status(400).json({ error: "TX transfer ke owner gagal/pending." });
    }

    const txUser = await provider.getTransaction(txHashUserToOwner);

    // FIX: validasi transfer ke kontrak, bukan langsung ke wallet owner!
    if (txUser.to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase())
      return res.status(400).json({ error: "Transaksi bukan ke kontrak token TBP." });

    const iface = new ethers.utils.Interface([
      "function transfer(address to, uint256 amount)"
    ]);
    const decoded = iface.decodeFunctionData("transfer", txUser.data);
    const toAddr = decoded.to.toLowerCase();
    const transferValue = decoded.amount;
    const expected = ethers.utils.parseUnits(total.toFixed(18), TBP_DECIMALS);

    if (toAddr !== OWNER_ADDRESS.toLowerCase())
      return res.status(400).json({ error: "Target transfer bukan wallet owner." });
    if (!expected.eq(transferValue))
      return res.status(400).json({ error: "Jumlah transfer tidak sesuai." });
    if (txUser.from.toLowerCase() !== user.wallet.toLowerCase())
      return res.status(400).json({ error: "Transfer bukan dari wallet user." });

    // 3. Proses burn otomatis oleh backend (pakai wallet owner)
    const tbpContract = new ethers.Contract(CONTRACT_ADDRESS, [
      "function burn(uint256 amount)"
    ], walletOwner); // walletOwner = new ethers.Wallet(PRIVATE_KEY_OWNER, provider)
    console.log("🔥 Mulai proses burn TBP:", burnAmount.toFixed());
    // 1. Ambil fee data dari jaringan
    const feeData = await provider.getFeeData();

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

    // 2. (Opsional) set gasLimit manual, cukup 60.000
    const GAS_LIMIT_BURN = 60000;

    // 3. Nonce
    const nonce = await walletOwner.getTransactionCount("pending");

    // 4. Kirim burn TX dengan setting gas dan nonce
    const burnTx = await tbpContract.burn(
      ethers.utils.parseUnits(burnAmount.toString(), TBP_DECIMALS),
      {
        ...gasSettings,
        gasLimit: GAS_LIMIT_BURN,
        nonce,
      }
    );

    console.log("🔃 Burn TX hash:", burnTx.hash);

    const receipt = await Promise.race([
      burnTx.wait(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: TX terlalu lama dikonfirmasi. TX Hash: ${burnTx.hash}`)), 60000)
      )
    ]);


    // 4. Update saldo & progress
    const [balance] = await UserBalance.findOrCreate({ where: { userId } });
    balance.race = balance.race.plus(total.mul(RACE_PER_TBP)).toFixed();
    balance.claimedTbp = Decimal.max(0, new Decimal(balance.claimedTbp).minus(total)).toFixed();
    await balance.save();

    if (progress && !progress.isActivated) {
      progress.tbpToRaceDone = new Decimal(progress.tbpToRaceDone).plus(total);
      if (
        new Decimal(progress.sbpToTbpDone).gte(progress.requiredSBP) &&
        new Decimal(progress.tbpToRaceDone).gte(progress.requiredTBP)
      ) {
        progress.isReady = true;
      }
      await progress.save();
    }

    // 5. Catat ke TbpToRaceHistory
    await TbpToRaceHistory.create({
      userId,
      tbpAmount: total.toString(),         // <-- pakai .toString()
      burnRate: burnRate,                 
      totalAmount: total.toString(),
      burnedAmount: burnAmount.toString(),
      receivedAmount: ownerAmount.toString(),
      txHashUserToOwner,
      txHashBurn: receipt.transactionHash,
      status: "success"
    });



    res.json({
      message: `✅ Berhasil konversi TBP ke RACE dengan burn ${burnRate}%. Burn: ${burnAmount.toFixed()} | Sisa owner: ${ownerAmount.toFixed()}`,
      raceAdded: total.mul(RACE_PER_TBP).toString(),
      txHashUserToOwner,
      txHashBurn: receipt.transactionHash,
    });
  } catch (err) {
    console.error("❌ Gagal proses konversi TBP ke RACE (with auto-burn):", err);
    res.status(500).json({ error: "Terjadi kesalahan saat konversi TBP ke RACE." });
  }
};

const getTbpToRaceHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await TbpToRaceHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    // Format agar mudah dibaca frontend (opsional, biar konsisten)
    const result = history.map((item) => ({
      time: item.createdAt,
      tbp: item.tbpAmount.toString(),
      burned: item.burnedAmount.toString(),
      received: item.receivedAmount.toString(),
      burnRate: item.burnRate.toString(),
      txHashUserToOwner: item.txHashUserToOwner || "-",
      txHashBurn: item.txHashBurn || "-",
      status: item.status,
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Gagal ambil history TBP ke RACE:", err);
    res.status(500).json({ error: "Gagal ambil data history konversi TBP ke RACE." });
  }
};


const getSbpToTbpHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await SbpToTbpHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.json(history);
  } catch (err) {
    console.error("❌ Gagal ambil history SBP to TBP:", err);
    res.status(500).json({ error: "Gagal ambil data history konversi." });
  }
};

const updateRupiahForSale = async (req, res) => {
  try {
    const userId = req.user.id;
    const amount = toDecimal(req.body.amount);

    if (amount.isNegative()) {
      return res.status(400).json({ error: "Jumlah tidak valid." });
    }

    const user = await User.findByPk(userId, {
      attributes: ["exchangerLevel", "isCompanyExchanger", "wallet"],
    });

    if (!user) {
      return res.status(404).json({ error: "User tidak ditemukan." });
    }

    // ❌ Tidak boleh kosong wallet-nya
    if (!user.wallet || user.wallet.trim() === "") {
      return res.status(400).json({ error: "Anda harus mengatur wallet address terlebih dahulu." });
    }

    const isExchanger =
      ["mid", "senior", "executive"].includes(user.exchangerLevel) || user.isCompanyExchanger;

    if (!isExchanger) {
      return res.status(403).json({ error: "Anda bukan exchanger." });
    }

    const [balance] = await UserBalance.findOrCreate({ where: { userId } });

    const currentRupiah = toDecimal(balance.rupiah);
    const currentForSell = toDecimal(balance.rupiahForSell);

    const delta = amount.minus(currentForSell); // perubahan dari yang sebelumnya

    if (delta.gt(0)) {
      // Tambah: pastikan cukup saldo
      if (delta.gt(currentRupiah)) {
        return res.status(400).json({ error: "Saldo rupiah tidak mencukupi." });
      }
      balance.rupiah = currentRupiah.minus(delta).toFixed();
    } else {
      // Kurangi: bebas
      balance.rupiah = currentRupiah.plus(delta.abs()).toFixed();
    }

    balance.rupiahForSell = amount.toFixed();
    await balance.save();

    res.json({ message: "✅ Rupiah untuk dijual berhasil diperbarui." });
  } catch (err) {
    console.error("❌ Gagal update rupiahForSell:", err);
    res.status(500).json({ error: "Gagal update Rupiah yang dijual." });
  }
};

const convertTbpToRupiah = async (req, res) => {
  const { amount, txHash, toUserId } = req.body;
  const userId = req.user.id;

  const COMPANY_WALLET = "0xf84461C7F7073789e0DBeF7D29a0370d6a33b72e".toLowerCase();

  try {
    // ⛔ Validasi input awal
    if (!amount || !txHash) {
      return res.status(400).json({ error: "Data tidak lengkap." });
    }

    // 🔍 Ambil data sender
    const sender = await User.findByPk(userId);
    if (!sender?.wallet) {
      return res.status(400).json({ error: "Wallet pengirim tidak ditemukan." });
    }

    // 🧭 Tentukan receiver dan wallet-nya
    let receiver, receiverWallet;
    const isCompany = toUserId === "company";

    if (isCompany) {
      receiver = await User.findOne({ where: { isCompanyExchanger: true } });
      receiverWallet = COMPANY_WALLET;
    } else {
      receiver = await User.findByPk(toUserId);
      if (!receiver) return res.status(400).json({ error: "Exchanger tidak ditemukan." });
      receiverWallet = receiver.wallet?.toLowerCase();
    }

    if (!receiverWallet) {
      return res.status(400).json({ error: "Wallet penerima tidak ditemukan." });
    }

    // ✅ Verifikasi transaksi blockchain
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      return res.status(400).json({ error: "Transaksi belum terkonfirmasi atau gagal." });
    }

    const tx = await provider.getTransaction(txHash);
    if (tx.to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
      return res.status(400).json({ error: "Transaksi bukan ke kontrak token TBP." });
    }

    const iface = new ethers.utils.Interface(["function transfer(address to, uint256 amount)"]);
    const decoded = iface.decodeFunctionData("transfer", tx.data);
    const to = decoded.to.toLowerCase();
    const transferAmount = decoded.amount;

    if (tx.from.toLowerCase() !== sender.wallet.toLowerCase()) {
      return res.status(400).json({ error: "Wallet pengirim tidak sesuai." });
    }

    if (to !== receiverWallet) {
      return res.status(400).json({ error: "Wallet penerima tidak sesuai." });
    }

    const expectedAmount = ethers.utils.parseUnits(amount.toString(), TBP_DECIMALS);
    if (!expectedAmount.eq(transferAmount)) {
      return res.status(400).json({ error: "Jumlah transfer tidak sesuai." });
    }

    // 💱 Ambil rate konversi
    const rateType = isCompany ? "user_to_company" : "user_to_exchanger";
    const rateConfig = await TbpToRupiahRateConfig.findOne({ where: { type: rateType } });

    if (!rateConfig) {
      return res.status(400).json({ error: "Konfigurasi rate belum tersedia." });
    }

    const tbpAmount = new Decimal(amount);
    const rupiahAmount = tbpAmount.mul(rateConfig.rate);

    // 💰 Update saldo sender
    const [senderBalance] = await UserBalance.findOrCreate({ where: { userId: sender.id } });
    senderBalance.rupiah = new Decimal(senderBalance.rupiah || 0).plus(rupiahAmount).toFixed();

    // 🏦 Update saldo receiver
    const [receiverBalance] = await UserBalance.findOrCreate({ where: { userId: receiver.id } });

    if (!isCompany) {
      const currentForSale = new Decimal(receiverBalance.rupiahForSell || 0);
      if (currentForSale.lessThan(rupiahAmount)) {
        return res.status(400).json({ error: "Saldo rupiahForSell exchanger tidak cukup." });
      }
      receiverBalance.rupiahForSell = currentForSale.minus(rupiahAmount).toFixed();
    }

    receiverBalance.rupiah = new Decimal(receiverBalance.rupiah || 0).plus(rupiahAmount).toFixed();

    // 💾 Simpan perubahan
    await senderBalance.save();
    await receiverBalance.save();

    // 📝 Log konversi
    await TbpToRupiahConversionLog.create({
      senderUserId: sender.id,
      receiverUserId: receiver.id,
      txHash,
      amountTbp: tbpAmount.toFixed(),
      amountRupiah: rupiahAmount.toFixed(),
      receiverType: isCompany ? "company" : "exchanger",
    });

    return res.json({
      message: `✅ Berhasil konversi ${tbpAmount.toFixed()} TBP ke Rp ${rupiahAmount.toFixed()}`,
      rupiahAdded: rupiahAmount.toFixed(),
      txHash,
    });

  } catch (err) {
    console.error("❌ Gagal konversi TBP ke Rupiah:", err);
    return res.status(500).json({ error: "Terjadi kesalahan saat konversi." });
  }
};




const getTbpToRupiahHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const logs = await TbpToRupiahConversionLog.findAll({
      where: {
        [Op.or]: [
          { senderUserId: userId },
          { receiverUserId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "sender",
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = logs.map((log) => ({
      time: log.createdAt,
      from: log.sender?.username || "-",
      to: log.receiverType === "company" ? "Company" : log.receiver?.username || "-",
      tbp: log.amountTbp,
      rupiah: log.amountRupiah,
      txHash: log.txHash,
    }));

    return res.json(result);
  } catch (err) {
    console.error("❌ Gagal ambil history TBP ke Rupiah:", err);
    res.status(500).json({ error: "Gagal ambil riwayat konversi TBP ke Rupiah." });
  }
};


module.exports = {
  getUserBalance,
  getUserSbpDetail,
  updateSbpForSale,
  claimTbp,
  convertSbpToTbp,
  convertTbpToRace,
  getSbpToTbpHistory,
  updateRupiahForSale,
  convertTbpToRupiah,
  getTbpToRupiahHistory,
  requestSbpToTbp,
  confirmSbpToTbp,
  getTbpToRaceHistory
};
