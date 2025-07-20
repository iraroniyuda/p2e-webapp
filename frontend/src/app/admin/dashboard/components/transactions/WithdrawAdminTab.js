"use client";
import { adminWithdrawExecute, adminWithdrawInquiry } from "@/services/apiClient";
import { useState } from "react";

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

export default function WithdrawAdminTab() {
  const [bankCode, setBankCode] = useState("BANKBCA014");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [inquiryDetail, setInquiryDetail] = useState(null);
  const [idtrx, setIdtrx] = useState(null);

  // Inquiry WD Admin
  const handleInquiry = async (e) => {
    e.preventDefault();
    setMessage("");
    setInquiryDetail(null);
    setLoading(true);
    setIdtrx(null);

    try {
      const res = await adminWithdrawInquiry({
        bankCode,
        nominal: Number(amount),
        bankAccountNumber: accountNumber,
      });
      setIdtrx(res?.idtrx);
      setInquiryDetail(res?.response || null);

      setMessage(
        res?.response?.message
          ? "✅ " + res.response.message
          : "✅ Inquiry berhasil. Rekening valid, silakan eksekusi WD."
      );
    } catch (err) {
      if (typeof err?.response?.data === "string" && err.response.data.includes("<html")) {
        setMessage("❌ Server MPStore tidak merespons (504 Timeout). Silakan coba lagi nanti.");
      } else {
        setMessage(err?.response?.data?.error || "Inquiry gagal.");
      }
      setInquiryDetail(null);
    }
    setLoading(false);
  };

  // Eksekusi WD Admin
  const handleExecute = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    setInquiryDetail(null);

    try {
      const res = await adminWithdrawExecute({
        bankCode,
        nominal: Number(amount),
        bankAccountNumber: accountNumber,
        idtrx,
        // Tidak perlu note
      });
      setMessage("✅ Withdraw berhasil diproses!\n" + (res?.response?.message || ""));
      setIdtrx(null); // Reset setelah sukses
    } catch (err) {
      if (typeof err?.response?.data === "string" && err.response.data.includes("<html")) {
        setMessage("❌ Server MPStore tidak merespons (504 Timeout). Silakan coba lagi nanti.");
      } else {
        setMessage(err?.response?.data?.error || "Gagal proses WD.");
      }
    }
    setLoading(false);
  };

  function renderInquiryDetail() {
    if (!inquiryDetail) return null;
    return (
      <div className="alert alert-secondary mt-2 text-dark" style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>
        {inquiryDetail.benefName && <div><b>Nama Penerima:</b> {inquiryDetail.benefName}</div>}
        {inquiryDetail.adminFee && <div><b>Biaya Admin:</b> Rp{Number(inquiryDetail.adminFee).toLocaleString("id-ID")}</div>}
        {inquiryDetail.status && <div><b>Status:</b> {inquiryDetail.status}</div>}
        {inquiryDetail.message && <div><b>Pesan:</b> {inquiryDetail.message}</div>}
        {Object.entries(inquiryDetail).map(([key, val]) =>
          !['benefName', 'adminFee', 'status', 'message'].includes(key) && val
            ? <div key={key}><b>{key}:</b> {String(val)}</div>
            : null
        )}
      </div>
    );
  }

  return (
    <form className="bg-dark p-3 rounded" style={{ maxWidth: 400 }}>
      <h2 className="text-xl font-bold mb-3 text-white">Withdraw Admin</h2>
      <div className="mb-2">
        <label className="form-label text-white">Bank Tujuan</label>
        <select className="form-select"
          value={bankCode}
          onChange={e => setBankCode(e.target.value)}
        >
          {BANK_LIST.map(b => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label className="form-label text-white">No. Rekening Tujuan</label>
        <input className="form-control" value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))} />
      </div>
      <div className="mb-2">
        <label className="form-label text-white">Nominal Transfer</label>
        <input className="form-control" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
      </div>
      <div className="d-flex gap-2 mb-2">
        <button className="btn btn-primary w-50" type="button" disabled={loading || !bankCode || !accountNumber || !amount}
          onClick={handleInquiry}
        >
          {loading ? "Proses Inquiry..." : "Inquiry"}
        </button>
        <button className="btn btn-success w-50" type="button" disabled={loading || !bankCode || !accountNumber || !amount}
          onClick={handleExecute}
        >
          {loading ? "Memproses WD..." : "Eksekusi WD"}
        </button>
      </div>
      {message && <div className="alert alert-info mt-2" style={{ whiteSpace: "pre-wrap" }}>{message}</div>}
      {idtrx && <div className="text-white small">ID Inquiry: {idtrx}</div>}
      {renderInquiryDetail()}
    </form>
  );
}