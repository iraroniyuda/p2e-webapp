"use client";

import {
    burnSbp,
    getSbpSettings,
    mintSbp,
    updateSbpPrice,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";

// ✅ Helper functions
const formatNumberWithSeparator = (value) => {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("id-ID").format(value);
};

const parseNumberFromFormatted = (formatted) => {
  return Number(String(formatted).replace(/\./g, "").replace(/,/g, ""));
};

export default function SBPTokenTab() {
  const [loading, setLoading] = useState(true);
  const [supply, setSupply] = useState(0);

  const [priceBuy, setPriceBuy] = useState(0);
  const [priceSell, setPriceSell] = useState(0);
  const [priceTbpInIdr, setPriceTbpInIdr] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [note, setNote] = useState("");

  const [mintAmount, setMintAmount] = useState(0);
  const [burnAmount, setBurnAmount] = useState(0);
  const [ownedSupply, setOwnedSupply] = useState(0);
  const [totalTransferred, setTotalTransferred] = useState(0);



  useEffect(() => {
    fetchSetting();
  }, []);

  useEffect(() => {
    if (priceBuy && priceTbpInIdr) {
      const rate = Number(priceBuy) / Number(priceTbpInIdr);
      setConversionRate(rate.toFixed(4));
    } else {
      setConversionRate(0);
    }
  }, [priceBuy, priceTbpInIdr]);

    const fetchSetting = async () => {
    try {
        const data = await getSbpSettings();
        setSupply(data.totalSupply);
        setPriceBuy(data.priceBuy);
        setPriceSell(data.priceSell);
        setPriceTbpInIdr(data.priceTbpInIdr);
        setTotalTransferred(data.totalTransferred || 0);
        setOwnedSupply(data.totalSupply - (data.totalTransferred || 0));

        setNote("");
    } catch (err) {
        alert("Gagal ambil data SBP");
    } finally {
        setLoading(false);
    }
    };


  const handleUpdatePrice = async () => {
    if (!priceBuy || !priceSell || !priceTbpInIdr) {
      return alert("Semua kolom harga wajib diisi");
    }

    try {
      await updateSbpPrice(priceBuy, priceSell, priceTbpInIdr, note);
      alert("✅ Harga berhasil diperbarui");
      fetchSetting();
    } catch {
      alert("Gagal update harga");
    }
  };

  const handleMint = async () => {
    if (!mintAmount) return alert("Isi jumlah mint");
    try {
      await mintSbp(mintAmount);
      alert("✅ Mint berhasil");
      setMintAmount(0);
      fetchSetting();
    } catch {
      alert("Mint gagal");
    }
  };

  const handleBurn = async () => {
    if (!burnAmount) return alert("Isi jumlah burn");
    try {
      await burnSbp(burnAmount);
      alert("✅ Burn berhasil");
      setBurnAmount(0);
      fetchSetting();
    } catch (err) {
      alert(err?.response?.data?.error || "Burn gagal");
    }
  };

  if (loading) {
    return (
      <div className="text-white">
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
              <h3>Harga SBP</h3>

              <Form.Group className="mb-3">
                <Form.Label>Harga Beli (IDR)</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithSeparator(priceBuy)}
                  onChange={(e) => setPriceBuy(parseNumberFromFormatted(e.target.value))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Harga Jual (IDR)</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithSeparator(priceSell)}
                  onChange={(e) => setPriceSell(parseNumberFromFormatted(e.target.value))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Harga TBP (IDR)</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithSeparator(priceTbpInIdr)}
                  onChange={(e) => setPriceTbpInIdr(parseNumberFromFormatted(e.target.value))}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rasio Konversi ke TBP</Form.Label>
                <Form.Control
                  type="text"
                  value={conversionRate}
                  disabled
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Catatan / Alasan (Opsional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Misal: penyesuaian mengikuti harga TBP"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Form.Group>

              <Button variant="success" onClick={handleUpdatePrice}>
                Simpan Harga
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="bg-dark text-white mb-4">
            <Card.Body>
                <h3>Total Supply: {formatNumberWithSeparator(supply)}</h3>
                <h5 className="text-info">
                Owned Supply: {formatNumberWithSeparator(ownedSupply)} S-BP
                </h5>
                <h6 className="text-muted">
                Total Transferred: {formatNumberWithSeparator(totalTransferred)} S-BP
                </h6>


              <Form.Group className="mb-3">
                <Form.Label>Mint S-BP</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithSeparator(mintAmount)}
                  onChange={(e) => setMintAmount(parseNumberFromFormatted(e.target.value))}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleMint}>
                Mint
              </Button>

              <hr className="my-4" />

              <Form.Group className="mb-3">
                <Form.Label>Burn S-BP</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumberWithSeparator(burnAmount)}
                  onChange={(e) => setBurnAmount(parseNumberFromFormatted(e.target.value))}
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
