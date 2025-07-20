"use client";



import apiClient, {
  activateUserAccount,
  claimPol,
  claimTbp,
  confirmSbpToTbp,
  convertTbpToRace,
  getPolClaimEligibility,
  getPolClaimHistory,
  getSbpToTbpConversionRate,
  getTbpBurnRate,
  getTbpToRaceHistory,
  getUserActivationProgress,
  requestSbpToTbp,
  updateRupiahForSale
} from "@/services/apiClient";
import { sendTbpToOwner } from "@/services/TokenBridge";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

const formatNumber = (num) => {
  const parsed = Number(num);
  return isNaN(parsed)
    ? ` ${num}`
    : parsed.toLocaleString("id-ID", { minimumFractionDigits: 0 });
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d)
    ? "-"
    : d.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

export default function BalanceSection() {
  const [balance, setBalance] = useState(null);
  const [sbpDetails, setSbpDetails] = useState([]);
  const [summary, setSummary] = useState({ total: 0, locked: 0, available: 0 });
  const [filter, setFilter] = useState({ from: "", to: "" });
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sbpForSale, setSbpForSale] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [conversionRate, setConversionRate] = useState(null);
  const [sbpToConvert, setSbpToConvert] = useState("");
  const [converting, setConverting] = useState(false);
  const [convertMessage, setConvertMessage] = useState("");
  const [tbpToConvert, setTbpToConvert] = useState("");
  const [convertingTbpToRace, setConvertingTbpToRace] = useState(false);
  const [tbpConvertMessage, setTbpConvertMessage] = useState("");
  const [sbpConvertHistory, setSbpConvertHistory] = useState([]);
  const [showConvertHistory, setShowConvertHistory] = useState(false);
  const [loadingConvertHistory, setLoadingConvertHistory] = useState(false);

  const [activating, setActivating] = useState(false);
  const [activationMessage, setActivationMessage] = useState("");
  const [rupiahForSale, setRupiahForSale] = useState("");
  const [savingRupiah, setSavingRupiah] = useState(false);
  const [rupiahMessage, setRupiahMessage] = useState("");

  const [polEligible, setPolEligible] = useState(false);
  const [polAmount, setPolAmount] = useState(0); // Untuk tampilkan jumlah POL
  const [claimingPol, setClaimingPol] = useState(false);
  const [claimPolMessage, setClaimPolMessage] = useState("");
  const [showPolHistory, setShowPolHistory] = useState(false);
  const [polClaimHistory, setPolClaimHistory] = useState([]);
  const [loadingPolHistory, setLoadingPolHistory] = useState(false);
  const [tbpBurnRate, setTbpBurnRate] = useState(0);

  const [tbpToRaceHistory, setTbpToRaceHistory] = useState([]);
  const [loadingTbpToRaceHistory, setLoadingTbpToRaceHistory] = useState(false);
  const [showTbpToRaceHistory, setShowTbpToRaceHistory] = useState(false);





  const [activationProgress, setActivationProgress] = useState({
    sbpToTbpDone: 0,
    requiredSBP: 0,
    tbpToRaceDone: 0,
    requiredTBP: 0,
    isReady: false,
    isActivated: false,
    packageName: null,
  });



  const isExchanger =
    balance?.exchangerLevel !== null || balance?.isCompanyExchanger === true;

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const [resBalance, resDetail] = await Promise.all([
        apiClient.get("/user/balance"),
        apiClient.get("/user/balance/sbp-detail", {
          params: {
            from: filter.from || undefined,
            to: filter.to || undefined,
          },
        }),
      ]);

      const sbpDetailList = Array.isArray(resDetail.data?.details)
        ? resDetail.data.details
        : [];
      const sbpSummary = resDetail.data?.summary || {
        totalLocked: 0,
        totalUnlocked: 0,
      };

      const totalLocked = Number(sbpSummary.totalLocked || 0);
      const totalUnlocked = Number(sbpSummary.totalUnlocked || 0);

      setBalance(resBalance.data);
      const rate = await getSbpToTbpConversionRate();
      setConversionRate(rate);

      setSbpDetails(sbpDetailList);
      setSummary({
        total: totalLocked + totalUnlocked,
        locked: totalLocked,
        available: totalUnlocked,
      });

      setSbpForSale(resBalance.data?.sbpForSale?.toString() || "");
      setRupiahForSale(resBalance.data?.rupiahForSell?.toString() || "");

    } catch (err) {
      console.error("❌ Gagal ambil saldo:", err);
      alert("Gagal mengambil data saldo.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSbpConvertHistory = async () => {
    setLoadingConvertHistory(true);
    try {
      const res = await apiClient.get("/user/balance/sbp-to-tbp-history");
      setSbpConvertHistory(res.data);
    } catch (err) {
      console.error("❌ Gagal ambil histori konversi:", err);
      alert("Gagal memuat histori konversi.");
    } finally {
      setLoadingConvertHistory(false);
    }
  };

  const handleSaveRupiahForSale = async () => {
  const val = parseInt(rupiahForSale);
  if (isNaN(val) || val < 0) {
    setRupiahMessage("Masukkan nilai yang valid.");
    return;
  }

  try {
    setSavingRupiah(true);
    setRupiahMessage("");
    await updateRupiahForSale(val);

    setRupiahMessage("✅ Rupiah untuk dijual berhasil diperbarui.");
    await fetchBalance();
  } catch (err) {
    console.error("❌ Gagal update Rupiah for sale:", err);
    setRupiahMessage(
      err?.response?.data?.error || "Gagal menyimpan perubahan."
    );

  } finally {
    setSavingRupiah(false);
  }
};

const fetchTbpToRaceHistory = async () => {
  setLoadingTbpToRaceHistory(true);
  try {
    const res = await getTbpToRaceHistory();
    setTbpToRaceHistory(res);
  } catch (err) {
    setTbpToRaceHistory([]);
    alert("Gagal memuat histori konversi TBP ke RACE.");
  } finally {
    setLoadingTbpToRaceHistory(false);
  }
};

  const fetchActivationProgress = async () => {
    try {
      const res = await getUserActivationProgress();
      setActivationProgress(res || {
        sbpToTbpDone: 0,
        requiredSBP: 0,
        tbpToRaceDone: 0,
        requiredTBP: 0,
        isReady: false,
        isActivated: false,
        packageName: null,
      });
    } catch (err) {
      console.error("❌ Gagal ambil progress aktivasi:", err);
      // Tetap tampilkan card dengan fallback kosong
      setActivationProgress({
        sbpToTbpDone: 0,
        requiredSBP: 0,
        tbpToRaceDone: 0,
        requiredTBP: 0,
        isReady: false,
        isActivated: false,
        packageName: null,
      });
    }
  };

  const fetchPolEligibility = async () => {
    try {
      const res = await getPolClaimEligibility();
      setPolEligible(res?.eligible || false);
      setPolAmount(res?.amount || 0);
    } catch (err) {
      setPolEligible(false);
      setPolAmount(0);
    }
  };

  const fetchPolClaimHistory = async () => {
    setLoadingPolHistory(true);
    try {
      const data = await getPolClaimHistory();
      setPolClaimHistory(data || []);
    } catch (err) {
      setPolClaimHistory([]);
    } finally {
      setLoadingPolHistory(false);
    }
  };


  useEffect(() => {
    fetchBalance();
    fetchSbpConvertHistory();
    fetchActivationProgress();
    fetchPolEligibility();
    fetchTbpToRaceHistory();
    (async () => {
      try {
        const res = await getTbpBurnRate();
        console.log("🔥🔥 Hasil getTbpBurnRate()", res); // <--- tambahkan ini
        setTbpBurnRate(Number(res?.burnRate) || 0);
      } catch (e) {
        console.log("🔥🔥 ERROR getTbpBurnRate()", e);
      }
    })();
  }, []);

  const handleFilter = () => fetchBalance();

  const handleSaveSbpForSale = async () => {
    const val = parseInt(sbpForSale);
    if (isNaN(val) || val < 0) {
      setSaveMessage("Masukkan nilai yang valid.");
      return;
    }

    try {
      setSaving(true);
      setSaveMessage("");
      await apiClient.post("/user/balance/exchanger/sbp-for-sale", {
        amount: val,
      });

      setSaveMessage("✅ SBP untuk dijual berhasil diperbarui.");
      await fetchBalance();
    } catch (err) {
      console.error("❌ Gagal update SBP for sale:", err);
      setSaveMessage("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

    const handleClaimTbp = async () => {
      setClaiming(true);
      setClaimMessage("");
      try {
        await claimTbp();
        setClaimMessage("✅ TBP berhasil diklaim ke onchain.");
        await fetchBalance();
      } catch (err) {
        console.error("❌ Gagal klaim TBP:", err);
        setClaimMessage("Gagal klaim TBP.");
      } finally {
        setClaiming(false);
      }
    };

    const handleConvertSbp = async () => {
      setConverting(true);
      setConvertMessage("");

      const parsed = parseInt(sbpToConvert);
      if (!parsed || parsed <= 0) {
        setConvertMessage("❌ Masukkan jumlah SBP yang valid.");
        setConverting(false);
        return;
      }

      try {
        // Step 1: Kirim permintaan request konversi
        const result = await requestSbpToTbp(parsed);
        console.log("🧾 Response dari requestSbpToTbp:", result);

        const historyId = result?.historyId;
        if (!historyId) {
          setConvertMessage("❌ Gagal memproses permintaan: ID histori kosong.");
          return;
        }

        setConvertMessage("⏳ Permintaan diterima, mengirim TBP ke wallet...");

        // Step 2: Kirim konfirmasi dan token
        await confirmSbpToTbp(historyId);

        setConvertMessage("✅ SBP berhasil dikonversi ke TBP dan dikirim ke wallet.");
        setSbpToConvert("");
        await fetchBalance();
        await fetchActivationProgress(); 
      } catch (err) {
        console.error("❌ Gagal konversi SBP:", err);
        setConvertMessage(err?.response?.data?.error || "❌ Terjadi kesalahan saat konversi.");
      } finally {
        setConverting(false);
      }
    };




    const handleConvertTbpToRace = async () => {
      setConvertingTbpToRace(true);
      setTbpConvertMessage("");

      const parsed = parseFloat(tbpToConvert);
      if (!parsed || parsed <= 0) {
        setTbpConvertMessage("❌ Masukkan jumlah TBP yang valid.");
        setConvertingTbpToRace(false);
        return;
      }

      try {
        setTbpConvertMessage(`⏳ Sedang proses konversi ${parsed} TBP, silakan tunggu sebentar`);
        const ownerTxHash = await sendTbpToOwner(parsed);

        // Kirim ke backend amount=parsed, bukan sisa
        await convertTbpToRace(parsed, ownerTxHash);

        setTbpConvertMessage(
          "✅ TBP berhasil dikonversi. Sistem akan burn otomatis sesuai burn rate!"
        );
        setTbpToConvert("");
        await fetchBalance();
        await fetchActivationProgress();
      } catch (err) {
        console.error("❌ Gagal konversi TBP ke RACE:", err);
        setTbpConvertMessage("❌ Gagal konversi TBP ke RACE.");
      } finally {
        setConvertingTbpToRace(false);
      }
    };



    const handleClaimPol = async () => {
      setClaimingPol(true);
      setClaimPolMessage("");
      try {
        await claimPol(); // dari apiClient
        setClaimPolMessage("✅ POL berhasil dikirim ke wallet Anda.");
        await fetchActivationProgress(); // biar polClaimed ke-update
      } catch (err) {
        setClaimPolMessage(err?.response?.data?.error || "❌ Gagal klaim POL.");
      } finally {
        setClaimingPol(false);
      }
    };



    const handleActivateAccount = async () => {
      setActivating(true);
      setActivationMessage("");
      try {
        const res = await activateUserAccount();
        setActivationMessage("✅ Akun berhasil diaktivasi.");
        await fetchActivationProgress();
        await fetchBalance();
      } catch (err) {
        console.error("❌ Aktivasi gagal:", err);
        setActivationMessage("❌ Aktivasi akun gagal.");
      } finally {
        setActivating(false);
      }
    };


  const sbp = Number(balance?.sbp || 0);
  const sbpForSaleVal = Number(balance?.sbpForSale || 0);
  const sbpAvailable = sbp - sbpForSaleVal;

  const rupiah = Number(balance?.rupiah || 0);
  const rupiahForSaleVal = Number(balance?.rupiahForSell || 0);
  const rupiahAvailable = rupiah - rupiahForSaleVal;


  return (
    <div className="text-white">
      <h2 className="mb-4">Saldo Anda</h2>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <>
          <Row xs={1} className="g-4 d-flex flex-column">

            {/* SBP Card */}
            <Col>
              <Card bg="dark" text="white" className="shadow rounded">
                <Card.Body>
                  <Card.Title>SBP</Card.Title>
                  <Card.Text className="fs-4">{formatNumber(sbp)}</Card.Text>

                  <ul className="text-sm">
                    {/* <li>Total Rinci: {formatNumber(summary.total)}</li> */}
                    <li>Terkunci: {formatNumber(summary.locked)}</li>
                    {/* <li>Tersedia (Unlocked): {formatNumber(summary.available)}</li>*/}
                    {isExchanger && (
                      <>
                        <li>Untuk Dijual ke TBP: {formatNumber(sbpForSaleVal)}</li>
                        <li>Tersedia: {formatNumber(sbpAvailable)}</li>
                      </>
                    )}
                  </ul>

                  <Button
                    variant="outline-light"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowDetail(!showDetail)}
                  >
                    {showDetail ? "Sembunyikan Rincian" : "Lihat Rincian"}
                  </Button>

                  <Collapse in={showDetail}>
                    <div className="mt-3">
                      <Form className="mb-3 d-flex flex-wrap gap-2 align-items-end">
                        <Form.Group>
                          <Form.Label>Dari</Form.Label>
                          <Form.Control
                            type="date"
                            value={filter.from}
                            onChange={(e) =>
                              setFilter({ ...filter, from: e.target.value })
                            }
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>Sampai</Form.Label>
                          <Form.Control
                            type="date"
                            value={filter.to}
                            onChange={(e) =>
                              setFilter({ ...filter, to: e.target.value })
                            }
                          />
                        </Form.Group>
                        <Button variant="primary" onClick={handleFilter}>
                          Terapkan
                        </Button>
                      </Form>

                      <Table size="sm" bordered variant="dark" responsive>
                        <thead>
                          <tr>
                            <th>Sumber</th>
                            <th>Jumlah</th>
                            <th>Dikunci Hingga</th>
                            <th>Tanggal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sbpDetails.map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.source}</td>
                              <td>{formatNumber(item.amount)}</td>
                              <td>{item.lockedUntil ? formatDate(item.lockedUntil) : "-"}</td>
                              <td>{formatDate(item.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Collapse>

                  {isExchanger && (
                    <div className="mt-4">
                      <hr />
                      <Form.Label>
                        Tentukan berapa banyak S-BP Anda yang ingin dijual:
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={sbpForSale}
                        onChange={(e) => setSbpForSale(e.target.value)}
                        min="0"
                        max={sbp}
                        placeholder="0"
                        className="mb-2"
                      />
                      <Button
                        variant="success"
                        onClick={handleSaveSbpForSale}
                        disabled={saving}
                      >
                        {saving ? "Menyimpan..." : "Simpan"}
                      </Button>
                      {saveMessage && (
                        <Alert
                          variant={saveMessage.startsWith("✅") ? "success" : "danger"}
                          className="mt-2 py-2 px-3"
                        >
                          {saveMessage}
                        </Alert>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* RACE */}
            <Col>
              <Card bg="dark" text="white" className="shadow rounded">
                <Card.Body>
                  <Card.Title>RACE</Card.Title>
                  <Card.Text className="fs-4">{formatNumber(balance?.race)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* Rupiah */}
            <Col>
              <Card bg="dark" text="white" className="shadow rounded">
                <Card.Body>
                  <Card.Title>Rupiah</Card.Title>
                  <Card.Text className="fs-4">Rp {formatNumber(rupiah)}</Card.Text>
                  {isExchanger && (
                    <ul className="text-sm">
                      <li>Untuk Dijual: Rp {formatNumber(rupiahForSaleVal)}</li>
                      <li>Tersedia: Rp {formatNumber(rupiahAvailable)}</li>
                    </ul>
                  )}
                  {isExchanger && (
                    <>
                      <hr />
                      <Form.Label>Tentukan berapa banyak Rupiah yang ingin dijual ke TBP:</Form.Label>
                      <Form.Control
                        type="number"
                        value={rupiahForSale}
                        onChange={(e) => setRupiahForSale(e.target.value)}
                        min="0"
                        max={balance?.rupiah || 0}
                        placeholder="0"
                        className="mb-2"
                      />
                      <Button
                        variant="success"
                        onClick={handleSaveRupiahForSale}
                        disabled={savingRupiah}
                      >
                        {savingRupiah ? "Menyimpan..." : "Simpan"}
                      </Button>
                      {rupiahMessage && (
                        <Alert
                          variant={rupiahMessage.startsWith("✅") ? "success" : "danger"}
                          className="mt-2 py-2 px-3"
                        >
                          {rupiahMessage}
                        </Alert>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* TBP */}
            {/* TBP (Belum Diklaim) */}
            <Col>
              <Card bg="dark" text="white" className="shadow rounded">
                <Card.Body>
                  <Card.Title>TBP (Belum Diklaim)</Card.Title>
                  <Card.Text className="fs-4">{formatNumber(balance?.tbp)}</Card.Text>

                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={handleClaimTbp}
                      disabled={claiming || Number(balance?.tbp) <= 0}
                    >
                      {claiming ? "Memproses..." : "Klaim TBP ke Onchain"}
                    </Button>

                    {claimMessage && (
                      <Alert
                        variant={claimMessage.startsWith("✅") ? "success" : "danger"}
                        className="py-2 px-3"
                      >
                        {claimMessage}
                      </Alert>
                    )}

                    {conversionRate && (
                      <>
                        <hr />
                        <Form.Label>Konversi SBP ke TBP (Onchain)</Form.Label>
                        <p className="small text-info mb-1">
                          💹 Rasio Konversi: {(
                            (conversionRate.tbpAmount / conversionRate.sbpAmount) *
                            100
                          ).toFixed(2)}%
                        </p>

                        <Form.Control
                          type="number"
                          placeholder="Jumlah SBP"
                          value={sbpToConvert}
                          onChange={(e) => setSbpToConvert(e.target.value)}
                          min="1"
                          max={sbpAvailable}
                        />

                        <Button
                          variant="info"
                          onClick={handleConvertSbp}
                          disabled={converting}
                        >
                          {converting ? "Mengonversi..." : "Konversi SBP ke TBP"}
                        </Button>

                        {convertMessage && (
                          <Alert
                            variant={convertMessage.startsWith("✅") ? "success" : "danger"}
                            className="py-2 px-3"
                          >
                            {convertMessage}
                          </Alert>
                        )}
                      </>
                    )}

                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => {
                        if (!showConvertHistory) fetchSbpConvertHistory();
                        setShowConvertHistory(!showConvertHistory);
                      }}
                    >
                      {showConvertHistory ? "Sembunyikan" : "Lihat"} Histori Konversi
                    </Button>
                  </div>

                  <Collapse in={showConvertHistory}>
                    <div className="mt-3">
                      {loadingConvertHistory ? (
                        <Spinner animation="border" variant="light" size="sm" />
                      ) : sbpConvertHistory.length === 0 ? (
                        <p className="text-muted">Belum ada histori konversi.</p>
                      ) : (
                        <Table size="sm" bordered variant="dark" responsive>
                          <thead>
                            <tr>
                              <th>SBP</th>
                              <th>TBP</th>
                              <th>Rasio</th>
                              <th>Waktu</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sbpConvertHistory.map((item, idx) => (
                              <tr key={idx}>
                                <td>{formatNumber(item.sbpAmount)}</td>
                                <td>{formatNumber(item.tbpAmount)}</td>
                                <td>{item.conversionRate}</td>
                                <td>{formatDate(item.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </div>
                  </Collapse>
                </Card.Body>
              </Card>
            </Col>


            {/* TBP (Terklaim / Onchain) */}
          <Col>
            <Card bg="dark" text="white" className="shadow rounded">
              <Card.Body>
                <Card.Title>TBP (Terklaim / Onchain)</Card.Title>
                <Card.Text className="fs-4">
                  {formatNumber(balance?.claimedTbp || 0)}
                </Card.Text>

                <p className="small text-info mb-1">
                  Burn Rate: {(tbpBurnRate * 100).toFixed(2)}% TBP akan diburn otomatis oleh Company setiap konversi TBP ke RACE.
                </p>

                <hr />

                {/* Konversi ke RACE */}
                <Form.Label className="mt-2">Konversi TBP ke RACE</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Jumlah TBP"
                  value={tbpToConvert}
                  onChange={(e) => setTbpToConvert(e.target.value)}
                  min="1"
                  max={balance?.claimedTbp}
                  className="mb-2"
                />
                <Button
                  variant="success"
                  onClick={handleConvertTbpToRace}
                  disabled={convertingTbpToRace}
                >
                  {convertingTbpToRace ? "Mengonversi..." : "Konversi ke RACE"}
                </Button>
                {tbpConvertMessage && (
                  <Alert
                    variant={tbpConvertMessage.startsWith("✅") ? "success" : "danger"}
                    className="mt-2 py-2 px-3"
                  >
                    {tbpConvertMessage}
                  </Alert>
                )}

                {/* Histori Konversi TBP ke RACE */}
                <div className="mt-3">
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => {
                      if (!showTbpToRaceHistory) fetchTbpToRaceHistory();
                      setShowTbpToRaceHistory(!showTbpToRaceHistory);
                    }}
                  >
                    {showTbpToRaceHistory ? "Sembunyikan" : "Lihat"} Histori Konversi TBP ke RACE
                  </Button>
                  <Collapse in={showTbpToRaceHistory}>
                    <div className="mt-3">
                      {loadingTbpToRaceHistory ? (
                        <Spinner animation="border" variant="light" size="sm" />
                      ) : tbpToRaceHistory.length === 0 ? (
                        <p className="text-white">Belum ada histori konversi TBP ke RACE.</p>
                      ) : (
                        <Table size="sm" bordered variant="dark" responsive>
                          <thead>
                            <tr>
                              <th>Waktu</th>
                              <th>TBP</th>
                              <th>Burned</th>
                              <th>Diterima Owner</th>
                              <th>Burn Rate</th>
                              <th>TX Transfer</th>
                              <th>TX Burn</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tbpToRaceHistory.map((item, idx) => (
                              <tr key={idx}>
                                <td>{formatDate(item.time)}</td>
                                <td>{formatNumber(item.tbp)}</td>
                                <td>{formatNumber(item.burned)}</td>
                                <td>{formatNumber(item.received)}</td>
                                <td>{Number(item.burnRate).toFixed(2)}%</td>
                                <td>
                                  {item.txHashUserToOwner && item.txHashUserToOwner !== "-" ? (
                                    <a
                                      href={`https://polygonscan.com/tx/${item.txHashUserToOwner}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-info"
                                    >
                                      {item.txHashUserToOwner?.substring(0, 10)}...
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td>
                                  {item.txHashBurn && item.txHashBurn !== "-" ? (
                                    <a
                                      href={`https://polygonscan.com/tx/${item.txHashBurn}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-info"
                                    >
                                      {item.txHashBurn?.substring(0, 10)}...
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td>{item.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </div>
                  </Collapse>
                </div>
              </Card.Body>
            </Card>
          </Col>



            <Col>
              <Card bg="dark" text="white" className="shadow rounded">
                <Card.Body>
                  <Card.Title>Claim POL</Card.Title>
                  {activationProgress.packageName ? (
                    activationProgress.polClaimed ? (
                      <Alert variant="success" className="mb-3">
                        ✅ POL sudah pernah diklaim.
                      </Alert>
                    ) : (
                      <>
                        {/* Tombol CLAIM POL */}
                        <div className="d-flex flex-column align-items-start mb-3 gap-2">
                          <Button
                            variant="success"
                            onClick={handleClaimPol}
                            disabled={claimingPol}
                            className="mb-2"
                            // HAPUS style width:100%
                          >
                            {claimingPol ? "Memproses..." : "CLAIM POL"}
                          </Button>
                          {claimPolMessage && (
                            <Alert
                              variant={claimPolMessage.startsWith("✅") ? "success" : "danger"}
                              className="py-2 px-3 mb-0"
                            >
                              {claimPolMessage}
                            </Alert>
                          )}
                        </div>
                      </>
                    )
                  ) : (
                    <Alert variant="secondary" className="mb-3">
                      Belum beli paket aktivasi. Silakan beli paket Green/Blue/Double Blue terlebih dahulu.
                    </Alert>
                  )}

                  {/* --- Toggle History POL (Selalu bawah sendiri) --- */}
                  <div className="d-flex flex-column align-items-start mt-2">
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="mb-2"
                      onClick={async () => {
                        if (!showPolHistory) await fetchPolClaimHistory();
                        setShowPolHistory(!showPolHistory);
                      }}
                      // HAPUS style width:100%
                    >
                      {showPolHistory ? "Sembunyikan" : "Lihat"} Histori Claim POL
                    </Button>
                    <Collapse in={showPolHistory}>
                      <div className="mt-2">
                        {loadingPolHistory ? (
                          <Spinner animation="border" variant="light" size="sm" />
                        ) : polClaimHistory.length === 0 ? (
                          <p className="text-white">Belum ada histori claim POL.</p>
                        ) : (
                          <Table size="sm" bordered variant="dark" responsive>
                            <thead>
                              <tr>
                                <th>Paket</th>
                                <th>Level</th>
                                <th>Nominal POL</th>
                                <th>Tanggal</th>
                                <th>TX Hash</th>
                              </tr>
                            </thead>
                            <tbody>
                              {polClaimHistory.map((item, idx) => (
                                <tr key={item.id || idx}>
                                  <td>{item.packageId || "-"}</td>
                                  <td>{item.levelName}</td>
                                  <td>
                                    {item.amountPOL
                                      ? <b>{formatNumber(typeof item.amountPOL === "object" ? item.amountPOL.toString() : item.amountPOL)}</b>
                                      : "-"}
                                  </td>
                                  <td>{formatDate(item.claimedAt)}</td>
                                  <td>
                                    <a
                                      href={`https://polygonscan.com/tx/${item.txHash}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-info"
                                    >
                                      {item.txHash?.substring(0, 10)}...
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </div>
                    </Collapse>
                  </div>
                </Card.Body>
              </Card>
            </Col>


            <Col>
              <Card bg="dark" text="white" className="shadow rounded">
                <Card.Body>
                  <Card.Title>
                    Activation {activationProgress.packageName ? `to ${activationProgress.packageName}` : ""}
                  </Card.Title>

                  {activationProgress.packageName ? (
                    <>
                      <p className="mb-2">
                        <strong>SBP Converted:</strong>{" "}
                        {formatNumber(activationProgress.sbpToTbpDone)} /{" "}
                        {formatNumber(activationProgress.requiredSBP)}
                      </p>
                      <p className="mb-3">
                        <strong>TBP Converted:</strong>{" "}
                        {formatNumber(activationProgress.tbpToRaceDone)} /{" "}
                        {formatNumber(activationProgress.requiredTBP)}
                      </p>

                      {activationProgress.isActivated ? (
                        <Alert variant="success" className="mb-0">
                          ✅ Akun sudah diaktivasi.
                        </Alert>
                      ) : activationProgress.isReady ? (
                        <>
                          <Button
                            variant="primary"
                            onClick={handleActivateAccount}
                            disabled={activating}
                          >
                            {activating ? "Mengaktifkan..." : "Activate Now"}
                          </Button>
                          {activationMessage && (
                            <Alert
                              variant={activationMessage.startsWith("✅") ? "success" : "danger"}
                              className="mt-2 py-2 px-3"
                            >
                              {activationMessage}
                            </Alert>
                          )}
                        </>
                      ) : (
                        <Alert variant="warning" className="mb-0">
                          ⚠️ Selesaikan konversi SBP dan TBP terlebih dahulu.
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert variant="secondary" className="mb-0">
                      Belum ada progress aktivasi akun. Silakan beli paket terlebih dahulu.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}
