"use client";

import {
  burnSbp,
  getSbpAllocationSummary,
  getSbpSettings,
  mintSbp,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";

const formatNumberWithSeparator = (value) =>
  value === 0 || value ? new Intl.NumberFormat("id-ID").format(value) : "";

const parseNumberFromFormatted = (formatted) =>
  Number(String(formatted).replace(/\./g, "").replace(/,/g, ""));

export default function SBPTokenTab() {
  const [loading, setLoading] = useState(true);

  const [mintAmount, setMintAmount] = useState(0);
  const [burnAmount, setBurnAmount] = useState(0);
  const [burnCategory, setBurnCategory] = useState("");
  const [note, setNote] = useState("");

  // Stats
  const [supply, setSupply] = useState(0);
  const [ownedSupply, setOwnedSupply] = useState(0);
  const [totalTransferred, setTotalTransferred] = useState(0);
  const [totalBurned, setTotalBurned] = useState(0);
  const [totalMined, setTotalMined] = useState(0);
  const [totalAirdropped, setTotalAirdropped] = useState(0);
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalSale, setTotalSale] = useState(0);
  const [totalBonus, setTotalBonus] = useState(0);

  const [categories, setCategories] = useState([]);
  

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [settings, alloc] = await Promise.all([
        getSbpSettings(),
        getSbpAllocationSummary(),
      ]);

      setSupply(settings.totalSupply || 0);
      setOwnedSupply(settings.ownedSupply || 0);
      setTotalTransferred(settings.totalTransferred || 0);
      setTotalBurned(settings.totalBurned || 0);
      setTotalMined(settings.totalMined || 0);
      setTotalAirdropped(settings.totalAirdropped || 0);
      setTotalStaked(settings.totalStaked || 0);
      setTotalSale(settings.totalSale || 0);
      setTotalBonus(settings.totalBonus || 0);

      

      setCategories(alloc.map((c) => c.category));
    } catch (err) {
      alert("❌ Gagal mengambil data SBP");
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    const parsed = Number(mintAmount);
    if (!parsed || parsed <= 0) return alert("Jumlah mint tidak valid");

    try {
      await mintSbp(parsed);
      alert("✅ Mint berhasil");
      setMintAmount(0);
      fetchAll();
    } catch (err) {
      alert(err?.response?.data?.error || "❌ Mint gagal");
    }
  };

  const handleBurn = async () => {
    if (!burnAmount) return alert("Isi jumlah burn");
    if (!burnCategory) return alert("Pilih kategori burn");

    try {
      await burnSbp(burnAmount, burnCategory, note);
      alert("✅ Burn berhasil");
      setBurnAmount(0);
      setBurnCategory("");
      setNote("");
      fetchAll();
    } catch (err) {
      alert(err?.response?.data?.error || "❌ Burn gagal");
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center py-5">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <div className="text-white">
      <Row>
        <Col md={6}>
          <Card className="bg-dark text-white mb-4">
            <Card.Body>
              <h3>Total Supply: {formatNumberWithSeparator(supply)} SBP</h3>

              <h6 className="text-warning">
                Total Burned: {formatNumberWithSeparator(totalBurned)} SBP
              </h6>
              <h6 className="text-success">
                Total Mined: {formatNumberWithSeparator(totalMined)} SBP
              </h6>
              <h6 className="text-info">
                Total Staked: {formatNumberWithSeparator(totalStaked)} SBP
              </h6>
              <h6 className="text-primary">
                Total Airdropped: {formatNumberWithSeparator(totalAirdropped)} SBP
              </h6>
              <h5 className="text-info">
                Owned Supply: {formatNumberWithSeparator(ownedSupply)} SBP
              </h5>
              <h6 className="text-info">
                Total Transferred: {formatNumberWithSeparator(totalTransferred)} SBP
              </h6>
              <h6 className="text-info">
                Total Sale: {formatNumberWithSeparator(totalSale)} SBP
              </h6>
              <h6 className="text-success">
                Total Bonus: {formatNumberWithSeparator(totalBonus)} SBP
              </h6>


              <Form.Group className="mb-3">
                <Form.Label>Mint SBP</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithSeparator(mintAmount)}
                  onChange={(e) =>
                    setMintAmount(parseNumberFromFormatted(e.target.value))
                  }
                  placeholder="Jumlah yang ingin dicetak"
                />
              </Form.Group>

              <Button variant="primary" onClick={handleMint}>
                Mint
              </Button>

              <hr className="my-4" />

              <Form.Group className="mb-3">
                <Form.Label>Burn SBP</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithSeparator(burnAmount)}
                  onChange={(e) =>
                    setBurnAmount(parseNumberFromFormatted(e.target.value))
                  }
                  placeholder="Jumlah yang ingin dibakar"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Kategori Burn</Form.Label>
                <Form.Select
                  value={burnCategory}
                  onChange={(e) => setBurnCategory(e.target.value)}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Catatan / Alasan (Opsional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Misal: burn karena redistribusi"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Form.Group>

              <Button variant="danger" onClick={handleBurn}>
                Burn
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
