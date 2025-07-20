"use client";

import { useAuth } from "@/contexts/AuthContext";
import { burnToken, getTBPTokenInfo, transferToken } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";

export default function TBPTokenTab() {
  const { user } = useAuth();

  const [tbpInfo, setTbpInfo] = useState({
    totalSupply: "Loading...",
    masterWalletBalance: "Loading...",
    burnedTokens: "Loading...",
  });

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTBPInfo();
  }, []);

  const fetchTBPInfo = async () => {
    try {
      const data = await getTBPTokenInfo();
      console.log("✅ Data TBP dari Backend (RAW):", data);

      setTbpInfo({
        totalSupply: formatNumber(cleanNumber(data.totalSupply || "0")),
        masterWalletBalance: formatNumber(cleanNumber(data.masterWalletBalance || "0")),
        burnedTokens: formatNumber(cleanNumber(data.burnedTokens || "0")),
      });
    } catch (error) {
      console.error("Error fetching TBP data", error);
      alert("Gagal mengambil data TBP.");
    }
  };

  const cleanNumber = (value) => {
    if (!value) return "0";
    return value.toString().replace(/,/g, "").replace(/\s/g, "").split(".")[0];
  };

  const formatNumber = (value) => {
    if (!value) return "0";
    try {
      return new Intl.NumberFormat("en-US").format(BigInt(value));
    } catch (error) {
      console.error("❌ Error Formatting Number:", value, error);
      return "0";
    }
  };

  const handleAmountChange = (e) => {
    const rawValue = cleanNumber(e.target.value);
    if (!isNaN(rawValue)) {
      setAmount(formatNumber(rawValue));
    }
  };

  const handleBurnAmountChange = (e) => {
    const rawValue = cleanNumber(e.target.value);
    if (!isNaN(rawValue)) {
      setBurnAmount(formatNumber(rawValue));
    }
  };

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      alert("Masukkan alamat penerima dan jumlah token.");
      return;
    }

    setLoading(true);
    try {
      const rawAmount = cleanNumber(amount);
      await transferToken(recipient, rawAmount);
      alert("Transfer Berhasil");
      setRecipient("");
      setAmount("");
      fetchTBPInfo();
    } catch (error) {
      alert("Gagal melakukan transfer.");
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!burnAmount) {
      alert("Masukkan jumlah token untuk dibakar.");
      return;
    }

    setLoading(true);
    try {
      const rawAmount = cleanNumber(burnAmount);
      await burnToken(rawAmount);
      alert("Burn Berhasil!");
      setBurnAmount("");
      fetchTBPInfo();
    } catch (error) {
      alert("Gagal melakukan burn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      <Row>
        <Col md={6}>
          <Card className="bg-dark text-white mb-4">
            <Card.Body>
              <h3>Informasi Token TBP</h3>
              <p>
                <strong>Total Supply:</strong> {tbpInfo.totalSupply} TBP
              </p>
              <p>
                <strong>Master Wallet Balance:</strong> {tbpInfo.masterWalletBalance} TBP
              </p>
              <p>
                <strong>Burned Tokens:</strong> {tbpInfo.burnedTokens} TBP
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="bg-dark text-white mb-4">
            <Card.Body>
              <h3>Transfer Token</h3>
              <Form.Group className="mb-3">
                <Form.Label>Recipient Address</Form.Label>
                <Form.Control
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount</Form.Label>
                <Form.Control value={amount} onChange={handleAmountChange} />
              </Form.Group>

              <Button
                variant="success"
                onClick={handleTransfer}
                disabled={loading}
                className="w-100"
              >
                Transfer Token
              </Button>
            </Card.Body>
          </Card>

          <Card className="bg-dark text-white">
            <Card.Body>
              <h3>Burn Token</h3>
              <Form.Group className="mb-3">
                <Form.Label>Burn Amount</Form.Label>
                <Form.Control
                  value={burnAmount}
                  onChange={handleBurnAmountChange}
                />
              </Form.Group>

              <Button
                variant="danger"
                onClick={handleBurn}
                disabled={loading}
                className="w-100"
              >
                Burn Token
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}