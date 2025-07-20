"use client";

import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Card, Form, Spinner, Table } from "react-bootstrap";

const formatNumberWithSeparator = (value) =>
  !value && value !== 0 ? "0" : new Intl.NumberFormat("id-ID").format(value);

export default function SBPTokenHistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get("/admin/sbp/history");

      const ascendingData = res.data.slice().reverse();
      let cumulativeTransfer = 0;

      const withOwned = ascendingData.map((item) => {
        cumulativeTransfer += Number(item.transferred || 0);
        return {
          ...item,
          ownedSupply: (item.totalSupply || 0) - cumulativeTransfer,
        };
      });

      setHistory(withOwned.reverse());
    } catch {
      alert("❌ Gagal ambil riwayat SBP");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = typeFilter === "ALL" ? history : history.filter(h => h.type === typeFilter);

  return (
    <div className="text-white">
      <Card className="bg-dark text-white">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Riwayat Transaksi SBP</h4>
            <Form.Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="ALL">Semua Tipe</option>
              <option value="mint">Mint</option>
              <option value="burn">Burn</option>
              <option value="transfer">Transfer</option>
              <option value="price-update">Price Update</option>
            </Form.Select>
          </div>

          {loading ? (
            <Spinner animation="border" variant="light" />
          ) : (
            <Table striped bordered hover variant="dark" responsive>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Tipe</th>
                  <th>Sumber</th>
                  <th>Catatan</th>
                  <th>Minted</th>
                  <th>Burned</th>
                  <th>Transferred</th>
                  <th>Total Supply</th>
                  <th>Owned Supply</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={idx}>
                    <td>{new Date(item.createdAt).toLocaleString("id-ID")}</td>
                    <td>{item.type}</td>
                    <td>{item.source || "-"}</td>
                    <td>{item.note}</td>
                    <td>{formatNumberWithSeparator(item.minted)}</td>
                    <td>{formatNumberWithSeparator(item.burned)}</td>
                    <td>{formatNumberWithSeparator(item.transferred)}</td>
                    <td>{formatNumberWithSeparator(item.totalSupply)}</td>
                    <td>{formatNumberWithSeparator(item.ownedSupply)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
