// src/services/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: false, // ⛔️ penting: kalau pakai Bearer token, ini harus false
  headers: {
    "Content-Type": "application/json",
  },
});


// ✅ Inject token setiap request dari localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwt_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);



// ✅ Fungsi Transfer Token
export const transferToken = async (recipient, amount) => {
  try {
    const response = await apiClient.post("/token/tbp/transfer", {
      recipient,
      amount,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error transferring TBP:", error);
    throw error;
  }
};

// ✅ Fungsi Burn Token
export const burnToken = async (amount) => {
  try {
    const response = await apiClient.post("/token/tbp/burn", {
      amount,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error burning TBP:", error);
    throw error;
  }
};

// ✅ Top-up saldo via MPStore (Dynamic VA / Redirect)
export const userTopUp = async (amount, bankCode) => {
  try {
    const response = await apiClient.post("/payment/user/topup", { amount, bankCode });
    return response.data;
  } catch (error) {
    console.error("❌ Error Top-Up:", error?.response?.data || error.message);
    throw error;
  }
};


export const getAllUsers = async () => {
  const response = await apiClient.get("/admin/sbp/all-users");
  return response.data;
};



export const listSbpUsers = async (page = 1, limit = 10) => {
  const res = await apiClient.get(`/admin/sbp/users?page=${page}&limit=${limit}`);
  return res.data;
};


export const transferSbpToUser = async (userId, amount, fromCategory) => {
  const res = await apiClient.post("/admin/sbp/transfer", { userId, amount,  fromCategory });
  return res.data;
};

export const deductSbpFromUser = async (userId, amount, toCategory, note = "") => {
  const res = await apiClient.post("/admin/sbp/deduct", {
    userId,
    amount,
    toCategory,
    note,
  });
  return res.data;
};




export const updateSbpPrice = async (priceBuy, priceSell, priceTbpInIdr, note) => {
  const res = await apiClient.post("/admin/sbp/update-price", {
    priceBuy,
    priceSell,
    priceTbpInIdr,
    note,
  });
  return res.data;
};


export const mintSbp = async (amount) => {
  const res = await apiClient.post("/admin/sbp/mint", { amount });
  return res.data;
};

export const burnSbp = async (amount, category, note = "") => {
  const res = await apiClient.post("/admin/sbp/burn", { 
    amount,
    category,
    note,
  });
  return res.data;
};

export const getSbpSettings = async () => {
  const response = await apiClient.get("/admin/sbp/settings");
  return response.data;
};

export const transferRaceToUser = async (userId, amount) => {
  return apiClient.post("/admin/race/transfer", { userId, amount });
};

export const listRaceUsers = async () => {
  const res = await apiClient.get("/admin/race/users");
  return res.data;
};

export const getRaceTransactionHistory = async () => {
  const res = await apiClient.get("/admin/race/history");
  return res.data;
};

export const userTopUpManual = async (sbpAmount, bankCode, exchangerId) => {
  const res = await apiClient.post("/payment/user/topup/manual", { sbpAmount, bankCode, exchangerId });
  return res.data;
};

export const userTopUpPackage = async (packageId, bankCode) => {
  const res = await apiClient.post("/payment/user/topup/package", { packageId, bankCode });
  return res.data;
};

export const getTopupPackages = async () => {
  const res = await apiClient.get("/payment/packages");
  return res.data;
};

export const getUserTransactionHistory = async () => {
  const res = await apiClient.get("/payment/user/transactions");
  return res.data;
};

export const checkVAStatus = async (idtrx) => {
  const res = await apiClient.get(`/payment/user/check-va-status?idtrx=${idtrx}`);
  return res.data;
};


export const getSuccessfulTransactionsSummary = async () => {
  const res = await apiClient.get("/payment/user/transactions/success-summary");
  return res.data;
};


// 🔹 Admin: Ambil semua paket top-up
export const getAdminTopupPackages = async () => {
  const res = await apiClient.get("/admin/topup/topup-packages");
  return res.data;
};

// 🔹 Admin: Update salah satu paket
export const updateAdminTopupPackage = async (id, payload) => {
  const res = await apiClient.put(`/admin/topup/topup-packages/${id}`, payload);
  return res.data;
};

// 🔹 Admin: Ambil semua jenis transaksi dari paket topup
export const getTopupTransactionTypes = async () => {
  const res = await apiClient.get("/admin/topup/topup-transactions");
  return res.data;
};

// 🔹 Admin: BonusConfig (Bonus Berdasarkan Transaksi & Referral)
export const getBonusConfigs = async () => {
  const res = await apiClient.get("/admin/bonus-config");
  return res.data;
};

export const createBonusConfig = async (payload) => {
  const res = await apiClient.post("/admin/bonus-config", payload);
  return res.data;
};

export const updateBonusConfig = async (id, payload) => {
  const res = await apiClient.put(`/admin/bonus-config/${id}`, payload);
  return res.data;
};

export const deleteBonusConfig = async (id) => {
  const res = await apiClient.delete(`/admin/bonus-config/${id}`);
  return res.data;
};


// 🔹 Admin: Lihat transaksi yang gagal apply
export const getFixTransactionPreview = async () => {
  const res = await apiClient.get("/admin/topup/fix-applied-preview");
  return res.data;
};

// 🔹 Admin: Apply semua transaksi yang belum di-apply
export const applyFixTransactions = async () => {
  const res = await apiClient.post("/admin/topup/fix-applied-execute");
  return res.data;
};

// ✅ Ambil saldo user (SBP, RACE, TBP, Rupiah)
export const getUserBalance = async () => {
  const res = await apiClient.get("/user/balance");
  return res.data;
};

export const updateSbpForSale = async (amount) => {
  const res = await apiClient.post("/user/balance/exchanger/sbp-for-sale", { amount });
  return res.data;
};


export const userWithdrawInquiry = async ({ bankCode, nominal }) => {
  try {
    const res = await apiClient.post("/payment/user/withdraw/inquiry", {
      bankCode,
      nominal,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error withdraw inquiry:", err?.response?.data || err.message);
    throw err;
  }
};

export const userWithdrawExecute = async ({ bankCode, nominal, idtrx }) => {
  try {
    const res = await apiClient.post("/payment/user/withdraw/execute", {
      bankCode,
      nominal,
      idtrx,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Error withdraw execute:", err?.response?.data || err.message);
    throw err;
  }
};



// 🔁 Ambil riwayat withdraw user
export const getWithdrawHistory = async () => {
  try {
    const res = await apiClient.get("/payment/user/withdraw-history");
    return res.data;
  } catch (err) {
    console.error("❌ Gagal ambil riwayat withdraw:", err?.response?.data || err.message);
    throw err;
  }
};

// 🔹 Admin: WithdrawConfig (Minimal WD)
export const getWithdrawConfigs = async () => {
  const res = await apiClient.get("/admin/withdraw-config");
  return res.data;
};

export const createWithdrawConfig = async (payload) => {
  const res = await apiClient.post("/admin/withdraw-config", payload);
  return res.data;
};

export const updateWithdrawConfig = async (id, payload) => {
  const res = await apiClient.post(`/admin/withdraw-config/update/${id}`, payload);
  return res.data;
};

export const deleteWithdrawConfig = async (id) => {
  const res = await apiClient.post(`/admin/withdraw-config/delete/${id}`);
  return res.data;
};


// 🔹 CMS CONTENT
export const getAdminCmsContents = async () => {
  const res = await apiClient.get("/admin/cms/content");
  return res.data;
};

export const createAdminCmsContent = async (payload) => {
  const res = await apiClient.post("/admin/cms/content", payload);
  return res.data;
};

export const updateAdminCmsContent = async (id, payload) => {
  const res = await apiClient.put(`/admin/cms/content/${id}`, payload);
  return res.data;
};

export const deleteAdminCmsContent = async (id) => {
  const res = await apiClient.delete(`/admin/cms/content/${id}`);
  return res.data;
};

// 🔹 CMS BANNERS
export const getAdminCmsBanners = async () => {
  const res = await apiClient.get("/admin/cms/banners");
  return res.data;
};

export const createAdminCmsBanner = async (payload) => {
  const res = await apiClient.post("/admin/cms/banners", payload);
  return res.data;
};

export const updateAdminCmsBanner = async (id, payload) => {
  const res = await apiClient.put(`/admin/cms/banners/${id}`, payload);
  return res.data;
};

export const deleteAdminCmsBanner = async (id) => {
  const res = await apiClient.delete(`/admin/cms/banners/${id}`);
  return res.data;
};

// 🔹 CMS TESTIMONIALS
export const getAdminCmsTestimonials = async () => {
  const res = await apiClient.get("/admin/cms/testimonials");
  return res.data;
};

export const createAdminCmsTestimonial = async (payload) => {
  const res = await apiClient.post("/admin/cms/testimonials", payload);
  return res.data;
};

export const updateAdminCmsTestimonial = async (id, payload) => {
  const res = await apiClient.put(`/admin/cms/testimonials/${id}`, payload);
  return res.data;
};

export const deleteAdminCmsTestimonial = async (id) => {
  const res = await apiClient.delete(`/admin/cms/testimonials/${id}`);
  return res.data;
};

export const uploadCmsMedia = async (formData) => {
  const res = await apiClient.post("/admin/cms/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// 🔓 Public CMS Access (untuk Home.js)
export const getPublicCmsContents = async () => {
  const res = await apiClient.get("/cms/content/home");
  return res.data;
};

export const getPublicCmsBanners = async () => {
  const res = await apiClient.get("/cms/banner");
  return res.data;
};

export const getPublicCmsTestimonials = async () => {
  const res = await apiClient.get("/cms/testimonial");
  return res.data;
};

export const getPublicRunningMediaImages = async () => {
  const res = await apiClient.get("/cms/running-media");
  return res.data;
};

// 🔑 Forgot Password
export const forgotPassword = async (email) => {
  const res = await apiClient.post("/auth/forgot-password", { email });
  return res.data;
};

// 🔑 Reset Password
export const resetPassword = async ({ email, token, newPassword }) => {
  const res = await apiClient.post("/auth/reset-password", {
    email,
    token,
    newPassword,
  });
  return res.data;
};

export const getSbpSourceRules = async () => {
  const res = await apiClient.get("/admin/sbp-source-rules");
  return res.data;
};

export const createSbpSourceRule = async (payload) => {
  const res = await apiClient.post("/admin/sbp-source-rules", payload);
  return res.data;
};

export const updateSbpSourceRule = async (id, payload) => {
  const res = await apiClient.put(`/admin/sbp-source-rules/${id}`, payload);
  return res.data;
};

export const deleteSbpSourceRule = async (id) => {
  const res = await apiClient.delete(`/admin/sbp-source-rules/${id}`);
  return res.data;
};

// ✅ Ambil detail penjabaran SBP user (summary + list)
export const getUserSbpDetail = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await apiClient.get(`/user/balance/sbp-detail${query ? `?${query}` : ""}`);
  return res.data;
};

// 🟦 Airdrop (Admin)
export const getAirdropSchedules = async () => {
  const res = await apiClient.get("/admin/airdrop/schedules");
  return res.data;
};

export const getAirdropScheduleDetail = async (id) => {
  const res = await apiClient.get(`/admin/airdrop/schedule/${id}`);
  return res.data;
};

export const approveAirdropParticipants = async (id, userIds) => {
  const res = await apiClient.post(`/admin/airdrop/${id}/approve`, { userIds });
  return res.data;
};

export const distributeAirdrop = async (id) => {
  const res = await apiClient.post(`/admin/airdrop/${id}/distribute`);
  return res.data;
};

export const createAirdropSchedule = async (payload) => {
  const res = await apiClient.post("/admin/airdrop/create", payload);
  return res.data;
};

// 🔄 Edit airdrop schedule
export const editAirdropSchedule = async (id, payload) => {
  const res = await apiClient.post(`/admin/airdrop/schedule/${id}/edit`, payload);
  return res.data;
};

// ❌ Delete airdrop schedule
export const deleteAirdropSchedule = async (id) => {
  const res = await apiClient.post(`/admin/airdrop/schedule/${id}/delete`);
  return res.data;
};

// 🟩 Airdrop (User)
export const getActiveAirdrops = async () => {
  const res = await apiClient.get("/airdrop/active");
  return res.data;
};

export const joinAirdrop = async (id) => {
  const res = await apiClient.post(`/airdrop/${id}/join`);
  return res.data;
};


export const getManualTopupConfig = async () => {
  const res = await apiClient.get("/admin/topup-config/manual-config");
  return res.data;
};

export const updateManualTopupConfig = async (id, data) => {
  const res = await apiClient.put(`/admin/topup-config/manual-config/${id}`, data);
  return res.data;
};



export const getPublicManualTopupConfig = async () => {
  const res = await apiClient.get("/manual-topup/config");
  return res.data;
};


export const getManualTopupRulePublic = async ({ exchangerId }) => {
  const params = exchangerId ? { exchangerId } : {};
  const res = await apiClient.get("/manual-topup/rule", { params });
  return res.data;
};


export const getSbpExchangePrice = async () => {
  const res = await apiClient.get("/user/balance/manual-topup/price/user-exchanger");
  return res.data.priceRupiah;
};



// Mengirim file gambar ke backend untuk OCR
export const ocrKtpImage = async (formData) => {
  try {
    const res = await apiClient.post("/kyc/ocr", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("OCR response:", res.data);

    // Ensure file_url is a string (select the first URL if it's an array)
    let { file_url } = res.data;

    if (Array.isArray(file_url)) {
      // If file_url is an array, select the first element
      file_url = file_url[0]; // Select the first element
    }

    return {
      ...res.data,
      file_url,  // Ensure file_url is now a string
    };

  } catch (error) {
    console.error("❌ OCR error:", error.message);
    throw new Error("OCR processing failed.");
  }
};





export const getKycStatus = async () => {
  try {
    const res = await apiClient.get("/kyc/status");
    return res.data;
  } catch (error) {
    handleApiError(error, "Failed to fetch KYC status.");
  }
};

export const submitKycData = async (formDataToSubmit) => {
  try {
    // (Opsional) log data sebelum submit
    console.log("Form Data to Submit:", formDataToSubmit);

    // Tidak perlu cek file_url di sini!
    // Backend sudah handle boleh tanpa file

    const response = await apiClient.post('/kyc/submit', formDataToSubmit, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting KYC data:', error.response?.data?.error || error.message);
    throw new Error('Submission failed. Please try again later.');
  }
};








export const getUserProfile = async () => {
  const res = await apiClient.get("/auth/profile");
  return res.data;
};

// ✅ Klaim TBP dari saldo virtual ke wallet on-chain
export const claimTbp = async () => {
  const res = await apiClient.post("/user/balance/claim-tbp");
  return res.data;
};



// 🔹 Admin: Exchanger Management
// 🔹 Admin: Manajemen Exchanger

// Ambil semua user dengan exchangerLevel ≠ "none"
export const getAllExchangerUsers = async () => {
  const res = await apiClient.get("/admin/exchanger/users");
  return res.data;
};

// Ambil semua user yang ditetapkan sebagai Company Exchanger
export const getCompanyExchangers = async () => {
  const res = await apiClient.get("/admin/exchanger");
  return res.data;
};

// Assign user tertentu sebagai Company Exchanger
export const assignCompanyExchanger = async (userId) => {
  const res = await apiClient.post("/admin/exchanger/assign", { userId });
  return res.data;
};

// 🔹 Admin: Exchanger Global Config
export const getExchangerConfig = async () => {
  const res = await apiClient.get("/admin/exchanger-config");
  return res.data;
};

export const updateExchangerConfig = async (payload) => {
  const res = await apiClient.post("/admin/exchanger-config/update", payload); 
  return res.data;
};



export const getAllAvailableExchangers = async (amount, type = "sbp") => {
  const res = await apiClient.get(`/exchanger/list-available`, {
    params: { amount, type },
  });
  return res.data;
};





export const getSbpAllocationCategories = async () => {
  const res = await apiClient.get("/admin/sbp/allocation-categories");
  return res.data;
};


export const getSbpAllocationSummary = async () => {
  const res = await apiClient.get("/admin/sbp/allocation-summary");
  return res.data;
};

export const userTopUpQris = async (amount) => {
  const res = await apiClient.post("/payment/user/topup/qris", { amount });
  return res.data;
};

// ✅ Lebih bersih dan reusable
export const connectWallet = async (address) => {
  const res = await apiClient.post("/auth/connect-wallet", { address });
  return res.data;
};

export const disconnectWallet = async () => {
  const res = await apiClient.post("/auth/disconnect-wallet");
  return res.data;
};

// Admin: Ambil konfigurasi mining
export const getMiningConfig = async () => {
  const res = await apiClient.get("/admin/mining/config");
  return res.data;
};

// Admin: Update konfigurasi mining
export const updateMiningConfig = async (payload) => {
  const res = await apiClient.post("/admin/mining/config/update", payload);
  return res.data;
};

// Admin: Ambil statistik klik harian + top user
export const getMiningStats = async () => {
  const res = await apiClient.get("/admin/mining/stats");
  return res.data;
};

// Admin: Ambil log klik dari user tertentu
export const getUserMiningLog = async (userId) => {
  const res = await apiClient.get(`/admin/mining/logs/${userId}`);
  return res.data;
};


// User: Ambil referral link pribadi
export const getMyMiningLink = async () => {
  const res = await apiClient.get("/mining/my-link");
  return res.data;
};

// User: Track klik referral (belum validasi)
export const trackMiningClick = async (ref) => {
  const res = await apiClient.post("/mining/track", { ref });
  return res.data;
};

// User: Validasi klik (1x per IP per hari)
export const validateMiningClick = async (ref) => {
  const res = await apiClient.post("/mining/validate", { ref });
  return res.data;
};

// User: Lihat preview reward mining
export const getMiningRewardPreview = async () => {
  const res = await apiClient.get("/mining/reward-preview");
  return res.data;
};

// User: Klaim reward mining
export const claimMiningReward = async () => {
  const res = await apiClient.post("/mining/claim-reward");
  return res.data;
};

// ✅ Admin: Ambil total SBP yang dimining
export const getTotalSbpMined = async () => {
  const res = await apiClient.get("/admin/sbp/total-mined");
  return res.data;
};

// 🟨 Daily Airdrop (Admin)
export const getDailyAirdropConfig = async () => {
  const res = await apiClient.get("/daily-airdrop/admin/config");
  return res.data;
};

export const updateDailyAirdropConfig = async (payload) => {
  const res = await apiClient.post("/daily-airdrop/admin/config/update", payload);
  return res.data;
};

// 🟨 Daily Airdrop (User)
export const checkDailyAirdropEligibility = async () => {
  const res = await apiClient.get("/daily-airdrop/user/eligibility");
  return res.data;
};

export const getDailyAirdropStatus = async () => {
  const res = await apiClient.get("/daily-airdrop/status");
  return res.data;
};

export const claimDailyAirdrop = async () => {
  const res = await apiClient.post("/daily-airdrop/user/claim");
  return res.data;
};


// 🔹 Staking (User)
export const stakeSbp = async (amount) => {
  const res = await apiClient.post("/staking/stake", { amount });
  return res.data;
};

export const unstakeAndClaim = async () => {
  const res = await apiClient.post("/staking/unstake-and-claim");
  return res.data;
};


export const getMyStakingStatus = async () => {
  const res = await apiClient.get("/staking/my-staking");
  return res.data;
};

// 🔹 Staking Config (Admin)
export const getStakingConfig = async () => {
  const res = await apiClient.get("/admin/staking");
  return res.data;
};

export const updateStakingConfig = async (payload) => {
  const res = await apiClient.post("/admin/staking/update", payload);
  return res.data;
};

// services/apiClient.js
export const getPublicStakingConfig = async () => {
  const res = await apiClient.get("/staking/config");
  return res.data;
};

// 🔹 Staking (User): Klaim Reward
export const claimStakingReward = async () => {
  const res = await apiClient.post("/staking/claim");
  return res.data;
};

// 🔹 Staking (User): Compound Reward
export const compoundStakingReward = async () => {
  const res = await apiClient.post("/staking/compound");
  return res.data;
};


export const getSbpToTbpConversionRate = async () => {
  const res = await apiClient.get("/conversion-rate/sbp-to-tbp");
  return res.data;
};

export const getConvertRupiahToSbpHistory = async () => {
  const res = await apiClient.get("/user/balance/convert-rupiah-to-sbp/history");
  return res.data.history;
};

export const getSbpToTbpConversionHistory = async () => {
  const res = await apiClient.get("/user/balance/sbp-to-tbp-history");
  return res.data;
};


export const setSbpToTbpConversionRate = async (sbpAmount, tbpAmount) => {
  const res = await apiClient.post("/admin/conversion-rate/sbp-to-tbp", {
    sbpAmount,
    tbpAmount,
  });
  return res.data;
};

export const convertSbpToTbp = async (sbpAmount) => {
  const res = await apiClient.post("/user/balance/convert-sbp-to-tbp", {
    sbpAmount,
  });
  return res.data;
};


export const requestSbpToTbp = async (sbpAmount) => {
  const res = await apiClient.post("/user/balance/convert-sbp-to-tbp/request", {
    sbpAmount,
  });
  return res.data; // harus mengembalikan { historyId, message }
};

export const confirmSbpToTbp = async (historyId) => {
  const res = await apiClient.post("/user/balance/convert-sbp-to-tbp/confirm", {
    historyId,
  });
  return res.data;
};


export const convertTbpToRace = async (amount, txHashUserToOwner) => {
  // amount di sini = JUMLAH YANG DIINPUT USER, bukan sisa setelah burn!
  const res = await apiClient.post("/user/balance/convert-tbp-to-race", {
    amount,
    txHashUserToOwner,
  });
  return res.data;
};


export const convertTbpToRupiah = async ({ amount, txHash, toUserId }) => {
  const res = await apiClient.post("/user/balance/convert-tbp-to-rupiah", {
    amount,
    txHash,
    toUserId,
  });
  return res.data;
};


export const getUserActivationProgress = async () => {
  const res = await apiClient.get("/user/activation-progress");
  return res.data;
};

export const activateUserAccount = async () => {
  const res = await apiClient.post("/activate-account");
  return res.data;
};

// 🔹 Admin: TBP to Rupiah Rate Config
export const getTbpToRupiahRates = async () => {
  const res = await apiClient.get("/admin/tbp-exchange-rate");
  return res.data; // array of { type, rate }
};

// ✅ Ambil semua rate TBP ke Rupiah (khusus user, bukan admin)
export const getPublicTbpToRupiahRates = async () => {
  const res = await apiClient.get("/user/tbp-exchange-rate");
  return res.data;
};


// 🔍 Ambil wallet address exchanger by userId
export const getWalletByUserId = async (userId) => {
  const res = await apiClient.get(`/user/wallet/${userId}`);
  return res.data;
};

// ✅ Submit hash dan verifikasi konversi TBP ke Rupiah
export const verifyTbpToRupiahConversion = async ({
  amount,
  txHash,
  recipientType,
  exchangerId = null,
}) => {
  if (!amount || !txHash || !recipientType) {
    throw new Error("❌ Parameter tidak lengkap untuk verifikasi konversi.");
  }

  const toUserId = recipientType === "exchanger" ? exchangerId : "company";

  const res = await apiClient.post("/user/balance/convert-tbp-to-rupiah", {
    amount,
    txHash,
    toUserId,
  });

  return res.data;
};

export async function getTbpToRaceHistory() {
  const res = await apiClient.get("/user/balance/tbp-to-race-history");
  return res.data;
}


// ✅ Ambil riwayat konversi TBP ke Rupiah
export const getTbpToRupiahHistory = async () => {
  const res = await apiClient.get("/user/balance/convert-tbp-to-rupiah/history");
  return res.data;
};

export const getUserBasicInfo = async () => {
  const res = await apiClient.get("/user/basic-info");
  return res.data; // { exchangerLevel, isCompanyExchanger, kycStatus }
};


export const setTbpToRupiahRate = async (type, rate) => {
  const res = await apiClient.post("/admin/tbp-exchange-rate/set", {
    type, // "user_to_company", "user_to_exchanger", atau "exchanger_to_company"
    rate, // angka integer
  });
  return res.data;
};

// 🔁 Exchanger: Set nilai Rupiah yang ingin dijual
export const updateRupiahForSale = async (amount) => {
  const res = await apiClient.post("/user/balance/exchanger/rupiah-for-sale", {
    amount,
  });
  return res.data;
};


export const convertRupiahToSbp = async (sbpAmount) => {
  const res = await apiClient.post("/user/balance/convert-rupiah-to-sbp", {
    sbpAmount,
  });
  return res.data;
};

export const getUserWalletAddress = async (userId) => {
  try {
    const res = await apiClient.get(`/user/wallet/${userId}`);
    return res.data.wallet;
  } catch (err) {
    console.error("❌ Gagal mengambil wallet address:", err);
    throw err.response?.data?.error || "Gagal mengambil wallet address.";
  }
};


export const mintTbpAdmin = async (toAddress, amountTbp) => {
  const res = await apiClient.post("/admin/token/mint", {
    toAddress,
    amountTbp,
  });
  return res.data;
};

export const transferTbpAdmin = async (toAddress, amountTbp) => {
  const res = await apiClient.post("/admin/token/transfer", {
    toAddress,
    amountTbp,
  });
  return res.data;
};

export const burnTbpAdmin = async (amountTbp) => {
  const res = await apiClient.post("/admin/token/burn", {
    amountTbp,
  });
  return res.data;
};

export const lockTbpP2PTransfer = async () => {
  const res = await apiClient.post("/admin/token/lock-p2p");
  return res.data;
};

export const unlockTbpP2PTransfer = async () => {
  const res = await apiClient.post("/admin/token/unlock-p2p");
  return res.data;
};


export const transferTbpOwnership = async (newOwnerAddress) => {
  const res = await apiClient.post("/admin/token/transfer-ownership", {
    newOwnerAddress,
  });
  return res.data;
};


export const setRewardRate = async (rewardRate) => {
  const res = await apiClient.post("/admin/token/set-reward-rate", { rewardRate });
  return res.data;
};
export const setMinimumStakeTime = async (minStakeTime) => {
  const res = await apiClient.post("/admin/token/set-min-stake-time", { minStakeTime });
  return res.data;
};
export const setStakingCap = async (stakeCap) => {
  const res = await apiClient.post("/admin/token/set-stake-cap", { stakeCap });
  return res.data;
};
// Ganti semua getter → hanya satu endpoint!
export const getTbpStakingConfig = async () => {
  const res = await apiClient.get("/admin/token/staking-config");
  return res.data; // { rewardRate, minStakeTime, stakingCap }
};

export const getUserTbpStakingConfig = async () => {
  const res = await apiClient.get("/user/token/staking-config");
  return res.data; // { rewardRate, minStakeTime, stakingCap }
};

export const getTotalSupply = async () => {
  const res = await apiClient.get("/admin/token/total-supply");
  return res.data; 
};

export const getTokenBalance = async (address) => {
  const res = await apiClient.get(`/admin/token/balance?address=${address}`);
  return res.data.balance;
};

export const isP2PAllowed = async () => {
  const res = await apiClient.get("/admin/token/p2p-status");
  return res.data.allowed;
};


export const getTBPTokenInfo = async () => {
  const res = await apiClient.get("/admin/token/info");
  return res.data;
};


export const fetchAllUsers = async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await apiClient.get(`/admin/users${query}`);
  return res.data;
};

export const getAllAdminAssets = async () => {
  const res = await apiClient.get("/admin/assets");
  return res.data.assets;
};


export const toggleUserSuspend = async (userId) => {
  const res = await apiClient.post(`/admin/users/${userId}/toggle-suspend`);
  return res.data;
};



export const updateCarPrice = async (id, newPrice, newValueSBP) => {
  const res = await apiClient.post(`/admin/assets/${id}/price`, {
    newPrice,
    newValueSBP,
  });
  return res.data;
};

export const updateUpgradeFlatPriceConfig = async (partType, newPrice, newValueSBP, newDurability) => {
  const res = await apiClient.post(`/admin/upgrade-price-configs/${partType}`, {
    newPrice,
    newValueSBP,
    newDurability,
  });
  return res.data;
};


export const getUpgradeFlatPriceConfigs = async () => {
  const res = await apiClient.get("/admin/upgrade-price-configs");
  return res.data.configs;
};



export const getReferralBonusConfigs = async () => {
  const res = await apiClient.get("/admin/referral-bonus");
  return res.data.configs;
};

export const updateReferralBonus = async (
  id,
  directBonusPercent,
  gen1BonusPercent,
  gen2BonusPercent,
  gen3BonusPercent,
  gen4BonusPercent,
  gen5BonusPercent,
  gen6BonusPercent
) => {
  const res = await apiClient.post(`/admin/referral-bonus/${id}`, {
    directBonusPercent,
    gen1BonusPercent,
    gen2BonusPercent,
    gen3BonusPercent,
    gen4BonusPercent,
    gen5BonusPercent,
    gen6BonusPercent,
  });
  return res.data;
};

export const getRaceEntryFeeConfigs = async () => {
  const res = await apiClient.get("/admin/race-entry-fee");
  return res.data;
};

// Ambil satu entry fee berdasarkan assetId
export const getRaceEntryFeeByAssetId = async (assetId) => {
  const res = await apiClient.get(`/admin/race-entry-fee/${assetId}`);
  return res.data;
};

// Simpan atau update entry fee
export const setRaceEntryFee = async ({ assetId, feeAmount, feeCurrency }) => {
  const res = await apiClient.post("/admin/race-entry-fee", {
    assetId,
    feeAmount,
    feeCurrency,
  });
  return res.data;
};


// 🔹 Admin: Circuit Owner Management

// Ambil semua user non-admin (untuk assign)
export const getUsersForCircuitOwnership = async () => {
  const res = await apiClient.get("/admin/circuit-owners/users");
  return res.data;
};

// Ambil semua user yang saat ini circuit owner
export const getCircuitOwners = async () => {
  const res = await apiClient.get("/admin/circuit-owners");
  return res.data;
};

// Assign user sebagai circuit owner
export const assignCircuitOwner = async (userId, level = "company") => {
  const res = await apiClient.post("/admin/circuit-owners/assign", { userId, level });
  return res.data;
};


// Unassign user dari circuit owner
export const unassignCircuitOwner = async (userId) => {
  const res = await apiClient.post("/admin/circuit-owners/unassign", { userId });
  return res.data;
};

// 🔹 User: Beli paket Circuit Owner
export const buyCircuitOwnerPackage = async (packageName) => {
  const res = await apiClient.post("/public/circuit-owner-packages/buy", { packageName });
  return res.data;
};



// 🔹 Untuk user biasa
export const getPublicCircuitOwnerPackages = async () => {
  const res = await apiClient.get("/public/circuit-owner-packages");
  return res.data;
};

// 🔹 Untuk admin
export const getAdminCircuitOwnerPackages = async () => {
  const res = await apiClient.get("/admin/circuit-owner-packages");
  return res.data;
};


export const updateCircuitOwnerPackage = async (id, payload) => {
  const res = await apiClient.post(`/admin/circuit-owner-packages/${id}`, payload);
  return res.data;
};

// 🏁 Championship - Enrollment

export const requestChampionship = async (payload) => {
  const res = await apiClient.post("/championship/request", payload);
  return res.data;
};

export const approveChampionshipRequest = async (id, payload) => {
  const res = await apiClient.post(`/championship/approve/${id}`, payload);
  return res.data;
};


export const registerToChampionship = async (payload) => {
  const res = await apiClient.post("/championship/register", payload);
  return res.data;
};

export const getChampionshipParticipants = async (championshipId) => {
  const res = await apiClient.get(`/championship/participants/${championshipId}`);
  return res.data;
};

export const approveOrRejectParticipant = async (participantId, action) => {
  const res = await apiClient.post(`/championship/participant/${participantId}`, {
    action, // "approve" atau "reject"
  });
  return res.data;
};


export const getMyChampionships = async () => {
  const res = await apiClient.get("/championship/my");
  return res.data;
};

// ✅ Admin: Ambil semua championship
export const getAllChampionships = async () => {
  const res = await apiClient.get("/championship/all");
  return res.data;
};


export const getUpcomingChampionships = async () => {
  const res = await apiClient.get("/championship/upcoming");
  return res.data;
};

export const getPendingChampionshipRequests = async () => {
  const res = await apiClient.get("/championship/pending");
  return res.data;
};


// 🏁 Championship - Gameplay

export const assignPhaseGroups = async (championshipId, phase, maxPerGroup, candidates = []) => {
  const body = {
    phase,
    maxPerGroup,
  };
  if (candidates.length > 0) {
    body.candidates = candidates;
  }
  const res = await apiClient.post(`/championship/gameplay/championship/${championshipId}/assign-groups`, body);
  return res.data;
};


export const markParticipantReady = async (groupId) => {
  const res = await apiClient.post(`/championship/gameplay/group/${groupId}/join-room`);
  return res.data;
};


export const getMatchGroups = async (championshipId, phase) => {
  const res = await apiClient.get(`/championship/gameplay/groups/${championshipId}?phase=${phase}`);
  return res.data;
};



export const getMyChampionshipGroups = async () => {
  const res = await apiClient.get("/championship/gameplay/groups/my");
  return res.data;
};


// ✅ Admin membuat room untuk grup
export const createRoomForGroup = async (groupId) => {
  const res = await apiClient.post(`/championship/gameplay/group/${groupId}/create-room`);
  return res.data;
};

// ✅ Unity/user join room
export const joinRoom = async (groupId) => {
  const res = await apiClient.post(`/championship/gameplay/group/${groupId}/join-room`);
  return res.data;
};



// ✅ Admin lihat siapa yang sudah masuk room
export const getRoomStatus = async (groupId) => {
  const res = await apiClient.get(`/championship/gameplay/group/${groupId}/room-status`);
  return res.data;
};
// ✅ Admin menandai grup sudah selesai/done
export const completeGroup = async (groupId) => {
  const res = await apiClient.post(`/championship/gameplay/group/${groupId}/complete-group`);
  return res.data;
};


// ✅ Admin trigger race (start balapan)
export const startGroupRace = async (groupId) => {
  const res = await apiClient.post(`/championship/gameplay/group/${groupId}/start-race`);
  return res.data;
};

export const submitGroupResult = async (groupId, results) => {
  const res = await apiClient.post(`/championship/gameplay/submit-result`, {
    groupId,
    results, // array of { userId, position, time }
  });
  return res.data;
};


export const promoteTopParticipants = async (
  championshipId,
  fromPhase,
  toPhase,
  topNPerGroup
) => {
  const res = await apiClient.post("/championship/gameplay/championship/promote", {
    championshipId,
    fromPhase,
    toPhase,
    topNPerGroup,
  });
  return res.data;
};

export const getPoolParticipantsForPhase = async (championshipId, phase) => {
  const res = await apiClient.get(`/championship/gameplay/championship/${championshipId}/promotion-pool`, {
    params: { phase },
  });
  return res.data; // harus array userId (atau objek peserta)
};


export const completeChampionshipFinal = async (championshipId) => {
  const res = await apiClient.post(
    `/championship/gameplay/championship/${championshipId}/complete`
  );
  return res.data;
};

export const getGrandFinalWinnersPreview = async (championshipId) => {
  const res = await apiClient.get(
    `/championship/gameplay/championship/${championshipId}/grandfinal-winners-preview`
  );
  return res.data;
};


// 🔹 Admin: Konfigurasi reward SBP per mobil race
export const getCarRaceRewardConfigs = async () => {
  const res = await apiClient.get("/admin/race-reward/car-race-reward-configs");
  return res.data;
};

export const updateCarRaceRewardConfig = async (assetId, winSbp) => {
  const res = await apiClient.post("/admin/race-reward/car-race-reward-configs", {
    assetId,
    winSbp,
  });
  return res.data;
};

// ✅ Ambil peserta per fase (admin)
export const getParticipantsByPhase = async (championshipId, phase) => {
  const res = await apiClient.get(
    `/championship/gameplay/championship/${championshipId}/phase-participants?phase=${phase}`
  );
  return res.data;
};


// 🔹 Admin: Referral Signup Bonus Config
export const getReferralSignupBonusConfig = async () => {
  const res = await apiClient.get("/referral-signup/config");
  return res.data;
};

export const updateReferralSignupBonusConfig = async (payload) => {
  const res = await apiClient.post("/referral-signup/config/update", payload);
  return res.data;
};

export const getSignupBonusConfig = async () => {
  const res = await apiClient.get("/signup-bonus/config");
  return res.data;
};

export const updateSignupBonusConfig = async (payload) => {
  const res = await apiClient.post("/signup-bonus/config/update", payload);
  return res.data;
};


// 🔹 Admin/User: Riwayat pemberian bonus referral saat signup
export const getReferralSignupBonusLogs = async (uplineUserId = null) => {
  const params = uplineUserId ? { uplineUserId } : {};
  const res = await apiClient.get("/referral-signup/logs", { params });
  return res.data;
};

// ✅ services/apiClient.js (atau file API client kamu)
export const getMyReferralSignupBonusSummary = async () => {
  const res = await apiClient.get("/user/referral-signup/my-log-summary");
  return res.data;
};

// ✅ Cek eligibility klaim POL (GET)
export const getPolClaimEligibility = async () => {
  const res = await apiClient.get("/claim-pol/eligibility");
  return res.data;
};

// ✅ Klaim POL (POST)
export const claimPol = async () => {
  const res = await apiClient.post("/claim-pol");
  return res.data;
};

// services/apiClient.js
export const getPolClaimHistory = async () => {
  const res = await apiClient.get("/claim-pol/history");
  return res.data.data;
};

// ✅ Ambil semua konfigurasi POL per level (GET)
export const listPolClaimConfig = async () => {
  const res = await apiClient.get("/admin/pol-claim-config/list");
  return res.data.data;
};

// ✅ Update nominal POL berdasarkan levelName (POST)
export const updatePolClaimConfig = async (levelName, amountPOL) => {
  const res = await apiClient.post("/admin/pol-claim-config/update", {
    levelName,
    amountPOL,
  });
  return res.data;
};

export const getTbpBurnRate = async () => {
  const res = await apiClient.get("/user/tbp-burn-rate");
  return res.data;
};


export const getAllPolClaimHistories = async (params = {}) => {
  const paramsCleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
  );
  const query = new URLSearchParams(paramsCleaned).toString();
  const res = await apiClient.get(`/admin/pol-claim-histories${query ? "?" + query : ""}`);
  return res.data;
};


export const getAllWithdrawalHistory = async (params = {}) => {
  const paramsCleaned = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
  );
  const query = new URLSearchParams(paramsCleaned).toString();
  const res = await apiClient.get(`/admin/withdrawal-history${query ? "?" + query : ""}`);
  return res.data;
};

// =========================
// ADMIN WITHDRAW
// =========================

/**
 * Inquiry WD admin (opsional, cek rekening valid)
 * @param {Object} param0
 * @returns {Promise}
 */
export const adminWithdrawInquiry = async ({ bankCode, nominal, bankAccountNumber }) => {
  // Tetap kirim bankAccountNumber ke backend untuk inquiry
  const res = await apiClient.post("/admin/withdraw/inquiry", {
    bankCode,
    nominal,
    bankAccountNumber, // WAJIB ada, karena admin manual input
  });
  return res.data;
};

/**
 * Eksekusi withdraw admin ke rekening manapun (no saldo check)
 * @param {Object} param0
 * @returns {Promise}
 */
export const adminWithdrawExecute = async ({ bankCode, nominal, bankAccountNumber, idtrx }) => {
  // Tidak perlu note
  const res = await apiClient.post("/admin/withdraw/execute", {
    bankCode,
    nominal,
    bankAccountNumber,
    idtrx, // ID dari hasil inquiry admin
  });
  return res.data;
};

export const saveTbpStakingHistory = async ({ action, amount, txHash }) => {
  try {
    const res = await apiClient.post("/staking/history", {  // ← ✅ perbaikan disini
      action,
      amount,
      txHash,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Gagal simpan history staking:", err?.response?.data || err.message);
    throw err;
  }
};



// ✅ Export Default API Client
export default apiClient;