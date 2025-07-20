"use client";
import { useAuth } from "@/contexts/AuthContext";
import {
  checkVAStatus,
  getAllAvailableExchangers,
  getManualTopupRulePublic,
  getTopupPackages,
  userTopUpManual,
  userTopUpPackage,
} from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function TopUpSection() {
  const [mode, setMode] = useState("package");
  const [sbpAmount, setSbpAmount] = useState("");
  const [bankCode, setBankCode] = useState("9");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [packages, setPackages] = useState([]);
  const [manualRule, setManualRule] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [availableExchangers, setAvailableExchangers] = useState([]);
  const [selectedExchangerId, setSelectedExchangerId] = useState("");
  const [maxAvailable, setMaxAvailable] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentIdtrx, setCurrentIdtrx] = useState(null);

  const { user, refreshUserProfile } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (mode === "package") fetchPackages();
    if (mode === "manual" && selectedExchangerId) fetchManualRule();
  }, [mode, user?.exchangerLevel, selectedExchangerId]);

  useEffect(() => {
    if (mode === "manual" && parseInt(sbpAmount) > 0) {
      fetchExchangers();
    } else {
      setAvailableExchangers([]);
      setSelectedExchangerId("");
      setManualRule(null);
    }
  }, [sbpAmount]);

  const userLevelMap = {
    white: 1,
    green: 2,
    blue: 3,
    double_blue: 4,
  };

  const exchangerLevelMap = {
    none: 0,
    mid: 1,
    senior: 2,
    executive: 3,
  };

  const fetchPackages = async () => {
    try {
      const res = await getTopupPackages();

      const currentUserLevel = userLevelMap[user?.userLevel || "white"];
      const currentExchangerLevel = exchangerLevelMap[user?.exchangerLevel || "none"];

      const filtered = res.filter((pkg) => {
        const title = (pkg.title || "").toLowerCase();

        // ❌ Sembunyikan paket white
        if (title.includes("white")) return false;

        // ❌ Hide paket user level yang sudah dimiliki atau lebih rendah
        if (title.includes("paket green") && currentUserLevel >= userLevelMap.green) return false;
        if (title.includes("paket blue") && !title.includes("double") && currentUserLevel >= userLevelMap.blue) return false;
        if (title.includes("double blue") && currentUserLevel >= userLevelMap.double_blue) return false;

        // ❌ Exchanger hanya untuk user level blue+
        const isExchangerPackage = title.includes("exchanger");
        const isUserLevelValid = currentUserLevel >= userLevelMap.blue;
        if (isExchangerPackage && !isUserLevelValid) return false;

        // ❌ Hide exchanger level yang sudah dimiliki atau lebih rendah
        if (title.includes("exchanger mid") && currentExchangerLevel >= exchangerLevelMap.mid) return false;
        if (title.includes("exchanger senior") && currentExchangerLevel >= exchangerLevelMap.senior) return false;
        if (title.includes("exchanger executive") && currentExchangerLevel >= exchangerLevelMap.executive) return false;

        return true;
      });


      setPackages(filtered);
    } catch (err) {
      console.error("❌ Failed to fetch packages:", err);
    }
  };


  const fetchManualRule = async () => {
    try {
      const rule = await getManualTopupRulePublic({ exchangerId: selectedExchangerId });
      setManualRule(rule);
    } catch (err) {
      console.error("❌ Failed:", err);
    }
  };

const fetchExchangers = async () => {
  try {
    const parsed = parseInt(sbpAmount);
    if (!parsed || parsed <= 0) return;

    const res = await getAllAvailableExchangers(parsed);
    if (!Array.isArray(res)) return;

    const filtered = res.filter((ex) => ex.id !== user.id); // ✅ filter out diri sendiri

    const options = [
      {
        id: "",
        username: "-- Choose Exchanger --",
        available: 0,
        isCompany: false,
      },
      ...filtered.map((ex) => ({
        id: ex.id,
        username: ex.username,
        available: ex.available,
        isCompany: ex.isCompany,
      })),
    ];

    setAvailableExchangers(options);
    setSelectedExchangerId("");
    setManualRule(null);
  } catch (err) {
    console.error("❌ Failed to fetch exchangers:", err);
    setAvailableExchangers([]);
    setSelectedExchangerId("");
    setManualRule(null);
  }
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const parsedBankCode = parseInt(bankCode);
    if (isNaN(parsedBankCode)) {
      setMessage("Bank invalid.");
      return;
    }

    try {
      setLoading(true);
      let result;

      if (mode === "manual") {
        const parsedSbp = parseInt(sbpAmount);
        if (!parsedSbp || parsedSbp <= 0) {
          setMessage("Enter valid amount of SBP.");
          return;
        }

        if (!manualRule?.priceRupiah || manualRule.priceRupiah <= 0) {
          setMessage("Price per 1 SBP not configured yet.");
          return;
        }

        result = await userTopUpManual(parsedSbp, parsedBankCode, selectedExchangerId);
      } else if (mode === "package") {
        if (!selectedPackageId) {
          setMessage("Choose Package First.");
          return;
        }
        result = await userTopUpPackage(selectedPackageId, parsedBankCode);
      }

      await refreshUserProfile();

      if (result?.redirectUrl) {
        setHtmlContent(`
          <div class="text-center">
            <p class="fs-5">Click button below to finish payment:</p>
            <a href="${result.redirectUrl}" target="_blank" class="btn btn-primary">
              Open Payment Page
            </a>
          </div>
        `);
        setShowModal(true);
        setCurrentIdtrx(result.idtrx);
      } else {
        setMessage("The purchase was successfully made, but there was no payment content..");
      }
    } catch (error) {
      console.error("❌ Top-Up Error:", error);
      const serverMessage = error?.response?.data?.error || "Purchase Failed.";
      setMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!currentIdtrx) return;
    try {
      const res = await checkVAStatus(currentIdtrx);
      const status = res?.message?.transactionStatusDesc || "Unknown";
      if (status === "Sales") {
        setPaymentStatus("success");
        setStatusMessage("");
      } else {
        setPaymentStatus("pending");
        setStatusMessage(`Status: ${status}. Please complete the payment and click check status again, or close and check history.`);
      }
    } catch (err) {
      console.error("❌ Failed to check status.:", err);
      setStatusMessage("❌ Failed to check payment status.");
    }
  };
  const getTabStyle = (key) => ({
    backgroundColor: mode === key ? "#28a745" : "white",
    color: mode === key ? "white" : "black",
    border: "1px solid #ced4da",
  });

  const parsedSbpAmount = parseInt(sbpAmount) || 0;
  const totalPrice = (manualRule?.priceRupiah || 0) * parsedSbpAmount;
  const obtainedSBP = (manualRule?.obtainedSBP || 0) * parsedSbpAmount;
  const obtainedRACE = (manualRule?.obtainedRACE || 0) * parsedSbpAmount;
  const obtainedTBP = (manualRule?.obtainedTBP || 0) * parsedSbpAmount;



  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-light">Deposit</h2>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className="px-3 py-1 rounded"
            style={getTabStyle("manual")}
            onClick={() => setMode("manual")}
          >
            SBP
          </button>
          <button
            type="button"
            className="px-3 py-1 rounded"
            style={getTabStyle("package")}
            onClick={() => setMode("package")}
          >
            Package
          </button>
        </div>


      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "manual" && (
          <>
            <input type="number" placeholder="Jumlah S-BP" value={sbpAmount} onChange={(e) => {
              const val = parseInt(e.target.value);
              if (maxAvailable && val > maxAvailable) {
                setSbpAmount(maxAvailable.toString());
              } else {
                setSbpAmount(e.target.value);
              }
            }} className="p-2 border rounded w-full" min="1" max={maxAvailable || undefined} required />

            {availableExchangers.length > 0 && (
              <select
                value={selectedExchangerId || ""}
                onChange={(e) => setSelectedExchangerId(parseInt(e.target.value))}
                className="p-2 border rounded w-full"
              >
                <option value="">-- Choose Exchanger --</option>
                {availableExchangers
                  .filter((ex) => ex.id !== "")
                  .map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.username} {ex.isCompany ? "(Company)" : ""} - Available: {ex.available}
                    </option>
                  ))}
              </select>
            )}


            {manualRule && parsedSbpAmount > 0 && (
              <div className="bg-gray-100 text-sm text-white p-3 rounded mt-2 space-y-1">
                <p>💰 <strong>Buy:</strong> Rp {totalPrice.toLocaleString("id-ID")}</p>
                <p>🎁 <strong>Get:</strong>
                  {obtainedSBP > 0 ? ` ${obtainedSBP} SBP` : ""}
                  {obtainedRACE > 0 ? `, ${obtainedRACE} RACE` : ""}
                  {obtainedTBP > 0 ? `, ${obtainedTBP} TBP` : ""}
                </p>
              </div>
            )}

          </>
        )}

        {mode === "package" && (
          <select value={selectedPackageId || ""} onChange={(e) => setSelectedPackageId(e.target.value)} className="p-2 border rounded w-full" required>
            <option value="">Choose Package</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>{pkg.title} - {pkg.obtainedSBP} SBP - Rp{(pkg.priceRupiah || 0).toLocaleString("id-ID")}</option>
            ))}
          </select>
        )}

        <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className="p-2 border rounded w-full" required>
          {/* <option value="7">QRIS</option> */}
          <option value="9">BCA</option>
          <option value="7">QRIS</option>
          <option value="10">Mandiri</option>
          <option value="13">BRI</option>
          <option value="14">BNI</option>
          <option value="15">Permata</option>
        </select>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded w-full text-white"
            style={{
              backgroundColor: loading ? "#000" : "#28a745",
              color: loading ? "#000" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Buy"}
          </button>

      </form>

      {message && (
        <div className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded">{message}</div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white text-dark w-full max-w-2xl rounded-xl overflow-hidden shadow-lg relative">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Payment</h3>
              <button onClick={() => {
                setShowModal(false);
                setHtmlContent(null);
                setSbpAmount("");
                setSelectedPackageId(null);
                setPaymentStatus(null);
                setStatusMessage("");
              }}>❌</button>
            </div>

            <div className="h-[600px] overflow-y-auto p-4 bg-white text-dark">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>

            <div className="p-4 border-t text-center space-y-2">
              {paymentStatus === "success" ? (
                <div className="text-green-700 bg-green-100 p-3 rounded">✅ Payment Success!</div>
              ) : statusMessage ? (
                <div className="text-yellow-800 bg-yellow-100 p-3 rounded">{statusMessage}</div>
              ) : null}
              <div className="flex justify-center gap-4 mt-2">
                <button onClick={() => {
                  setShowModal(false);
                  setHtmlContent(null);
                  setSbpAmount("");
                  setSelectedPackageId(null);
                  setPaymentStatus(null);
                  setStatusMessage("");
                }} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}