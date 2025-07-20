"use client";

import { getMiningRewardPreview } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";

export default function MiningRewardPreviewTab() {
  const [data, setData] = useState(null);

  const fetchPreview = async () => {
    try {
      const res = await getMiningRewardPreview();
      setData(res);
    } catch (err) {
      console.error("❌ Gagal memuat reward preview:", err);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  if (!data) return <p>Memuat data reward...</p>;

  return (
    <Card bg="dark" text="white" className="p-4">
      <h5 className="mb-3">Cek Reward Mining</h5>
      <p>Total valid click: <strong>{data.totalValidClicks}</strong></p>
      <p>Total reward group: <strong>{data.rewardGroups}</strong></p>
      <p>Potensi reward:</p>
      <ul>
        <li>SBP: {data.rewards.SBP}</li>
        <li>TBP: {data.rewards.TBP}</li>
      </ul>
    </Card>
  );
}
