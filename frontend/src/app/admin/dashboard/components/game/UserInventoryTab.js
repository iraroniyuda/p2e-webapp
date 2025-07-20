"use client";

import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";

export default function UserInventoryTab() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/admin/user-inventory");
        setInventories(res.data);
      } catch (err) {
        setError("Gagal memuat data inventory.");
        console.error("❌ Error load inventory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h5 className="mb-3">Inventory Pemain</h5>
      <Table striped bordered hover responsive variant="dark">
        <thead>
          <tr>
            <th>User</th>
            <th>Asset Type</th>
            <th>Asset ID</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {inventories.map((item) => (
            <tr key={item.id}>
              <td>{item.user?.username || item.userId}</td>
              <td>{item.assetType}</td>
              <td>{item.assetId}</td>
              <td>{new Date(item.createdAt).toLocaleString("id-ID")}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
