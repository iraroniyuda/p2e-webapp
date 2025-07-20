"use client";

import { userWithdrawExecute, userWithdrawInquiry } from "@/services/apiClient";
import { useEffect, useState } from "react";

export default function CreateWithdrawForm() {
  const [bankCode, setBankCode] = useState("BANKBCA014");
  const [bankSearch, setBankSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [idtrx, setIdtrx] = useState(null);
  const [minWithdraw, setMinWithdraw] = useState(null); // null saat awal

  // Fetch minimal withdraw saat mount pertama kali
  useEffect(() => {
    // Simple: lakukan request inquiry nominal kecil untuk dapat error + minWithdraw
    const getMinFromBackend = async () => {
      try {
        // Trigger inquiry dengan nominal kecil (akan error, tapi dapat min)
        await userWithdrawInquiry({
          bankCode,
          nominal: 1,
        });
      } catch (err) {
        const min = err?.response?.data?.minWithdraw;
        if (min) setMinWithdraw(Number(min));
        // optional: set message kosong agar tidak menampilkan error pada load awal
        setMessage("");
      }
    };
    getMinFromBackend();
    // eslint-disable-next-line
  }, [bankCode]);

  // Hanya angka bulat
  function handleAmountChange(e) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
  }
  const BANK_LIST = [
    { name: "BANK BRI", code: "BANKBRI002" },
    { name: "BANK MANDIRI", code: "BANKMANDIRI008" },
    { name: "BANK BNI", code: "BANKBNI009" },
    { name: "BANK BCA", code: "BANKBCA014" },
    { name: "BANK DANAMON", code: "BANKDANAMON011" },
    { name: "BANK PERMATA", code: "BANKPERMATA013" },
    { name: "BANK BJB (BPD JABAR)", code: "BANKBJB110" },
    { name: "BANK DKI (BPD DAERAH KHUSUS IBUKOTA JAKARTA)", code: "BANKDKI111" },
    { name: "BANK DIY (BPD DAERAH ISTIMEWA YOGYAKARTA)", code: "BANKDIY112" },
    { name: "BANK JATENG (BPD JAWA TENGAH)", code: "BANKJATENG113" },
    { name: "BANK JATENG SYARIAH (BPD JATENG)", code: "SYJGIDJ1113" },
    { name: "BANK JATIM SYARIAH (BPD JAWA TIMUR)", code: "SYJTIDJ1114" },
    { name: "BANK JATIM (BPD JAWA TIMUR)", code: "BANKJATIM114" },
    { name: "BANK JAMBI (BPD JAMBI)", code: "BANKJAMBI115" },
    { name: "BANK ACEH SYARIAH (BPD ACEH)", code: "SYACIDJ1116" },
    { name: "BANK ACEH (BPD ACEH)", code: "BANKACEH116" },
    { name: "BANK SUMUT (BPD SUMATERA UTARA)", code: "BANKSUMUT117" },
    { name: "BANK NAGARI (BPD SUMATERA BARAT)", code: "BANKNAGARI118" },
    { name: "BANK RIAU KEPRI (BPD RIAU DAN KEPRI)", code: "BANKRIAU119" },
    { name: "BANK SUMSEL BABEL (BPD SUMSEL DAN BABEL)", code: "BANKSUMSEL120" },
    { name: "BANK LAMPUNG (BPD LAMPUNG)", code: "BANKLAMPUNG121" },
    { name: "BANK KALSEL (BPD KALIMANTAN SELATAN)", code: "BANKKALSEL122" },
    { name: "BANK KALBAR SYARIAH (BPD KALIMANTAN BARAT)", code: "SYKBIDJ1123" },
    { name: "BANK KALBAR (BPD KALIMANTAN BARAT)", code: "BANKKALBAR123" },
    { name: "BANK KALTIMTARA (BPD KALIMANTAN TIMUR DAN UTARA)", code: "BANKKALTIM124" },
    { name: "BANK KALTENG (BPD KALIMANTAN TENGAH)", code: "BANKKALTENG125" },
    { name: "BANK SULSELBAR (BPD SULSELBAR)", code: "BANKSULSEL126" },
    { name: "BANK SULUT (BPD SULAWESI UTARA)", code: "BANKSULUT127" },
    { name: "BANK NTB (BPD NUSA TENGGARA BARAT)", code: "BANKNTB128" },
    { name: "BANK NTB SYARIAH (BPD NUSA TENGGARA BARAT)", code: "PDNBIDJ1128" },
    { name: "BANK BALI (BPD BALI)", code: "BANKBPD129" },
    { name: "BANK NTT (BPD NUSA TENGGARA TIMUR)", code: "BANKNTT130" },
    { name: "BANK MALUKU (BPD MALUKU)", code: "BANKMALUKU131" },
    { name: "BANK PAPUA (BPD PAPUA)", code: "BANKPAPUA132" },
    { name: "BANK BENGKULU (BPD BENGKULU)", code: "BANKBENGKULU133" },
    { name: "BANK SULTENG (BPD SULAWESI TENGAH)", code: "BANKSULTENG134" },
    { name: "BANK SULTRA (BPD SULAWESI TENGGARA)", code: "BANKSULTRA135" },
    { name: "BANK BANTEN (BPD BANTEN)", code: "BANKBANTEN137" },
    { name: "BANK MUAMALAT INDONESIA", code: "BANKMI147" },
    { name: "BANK BTN (BANK TABUNGAN NEGARA)", code: "BANKTN200" },
    { name: "BANK SYARIAH INDONESIA (BSI)", code: "BANKBRIS422" },
    { name: "BANK BJB SYARIAH (BANK JABAR BANTEN SYARIAH)", code: "BANKJABARBS425" },
    { name: "BANK MEGA", code: "BANKMEGA426" },
    { name: "BANK BNI SYARIAH", code: "BANKBNIS427" },
    { name: "BANK BUKOPIN", code: "BANKBUKOPIN441" },
    { name: "BANK ARTOS INDONESIA/JAGO", code: "BANKARTOS542" },
    { name: "BANK MANDIRI SYARIAH", code: "BANKMANDIRIS451" },
  ];

    const filteredBanks = BANK_LIST.filter(bank =>
      bank.name.toLowerCase().includes(bankSearch.toLowerCase())
    );
  const handleInquiry = async (e) => {
    e.preventDefault();
    setMessage("");
    setIdtrx(null);
    setLoading(true);

    try {
      const res = await userWithdrawInquiry({
        bankCode,
        nominal: Number(amount),
      });

      setIdtrx(res?.idtrx);
      setMessage("✅ Inquiry berhasil. Silakan klik 'Lanjutkan Withdraw'.");
    } catch (err) {
      const min = err?.response?.data?.minWithdraw;
      if (min) setMinWithdraw(Number(min));
      setMessage(err?.response?.data?.error || "Gagal melakukan inquiry withdraw.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!idtrx) return;

    setMessage("⏳ Memproses withdraw...");
    setLoading(true);

    try {
      const res = await userWithdrawExecute({
        bankCode,
        nominal: Number(amount),
        idtrx,
      });

      if (res?.response?.source === "EXECUTE") {
        setMessage("✅ Withdraw berhasil diproses.");
      } else {
        setMessage("⚠️ Respon tidak valid. Mungkin ini masih hasil inquiry.");
      }
    } catch (err) {
      setMessage(err?.response?.data?.error || "Gagal memproses withdraw.");
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = (bgColor, isActive) => ({
    backgroundColor: isActive ? bgColor : "white",
    color: isActive ? "white" : "black",
    border: "1px solid #ced4da",
  });

  // Tombol inquiry disable jika amount kosong atau < minimal
  const isInquiryDisabled =
    loading ||
    !amount ||
    !minWithdraw ||
    Number(amount) < minWithdraw;

return (
    <form onSubmit={handleInquiry} className="space-y-4" style={{ maxWidth: 360 }}>
      {/* Input search bank */}
      <input
        type="text"
        placeholder="Cari bank..."
        value={bankSearch}
        onChange={e => setBankSearch(e.target.value)}
        className="p-2 rounded text-black border w-100 mb-1"
        style={{ width: 340 }}
      />

      <select
        value={bankCode}
        onChange={(e) => setBankCode(e.target.value)}
        className="p-2 rounded text-black border w-100"
        required
        style={{ width: 340 }}
      >
        {filteredBanks.length === 0 ? (
          <option disabled value="">
            Bank tidak ditemukan
          </option>
        ) : (
          filteredBanks.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))
        )}
      </select>


      <div>
        <input
          type="text"
          pattern="[0-9]*"
          inputMode="numeric"
          placeholder={
            minWithdraw
              ? `Jumlah (minimal Rp${minWithdraw.toLocaleString("id-ID")})`
              : "Jumlah"
          }
          value={amount}
          onChange={handleAmountChange}
          className="p-2 rounded text-black border w-100"
          min={minWithdraw || 0}
          required
          style={{ width: 340 }}
        />
        <div className="text-sm text-white mt-1">
          {amount
            ? `Rp${Number(amount).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`
            : minWithdraw
              ? `Minimal Rp${minWithdraw.toLocaleString("id-ID")}`
              : ""}
        </div>
      </div>

      <button
        type="submit"
        disabled={isInquiryDisabled}
        className="w-full py-2 rounded border"
        style={buttonStyle("#007bff", !isInquiryDisabled)}
      >
        {loading ? "Memproses Inquiry..." : "Lanjut Inquiry"}
      </button>

      {idtrx && (
        <button
          type="button"
          onClick={handleExecute}
          disabled={loading}
          className="w-full py-2 rounded border"
          style={buttonStyle("#28a745", !loading)}
        >
          {loading ? "Memproses Withdraw..." : "Lanjutkan Withdraw"}
        </button>
      )}

      {message && (
        <div className="bg-yellow-900 text-white p-3 rounded mt-2 whitespace-pre-wrap">
          {message}
        </div>
      )}

      {idtrx && (
        <div className="p-2 w-full rounded text-white bg-gray-800 border">
          ID Transaksi: <code>{idtrx}</code>
        </div>
      )}
    </form>
  );
}
