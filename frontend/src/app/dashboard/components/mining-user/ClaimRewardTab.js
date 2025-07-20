"use client";

import { claimMiningReward } from "@/services/apiClient";
import { useState } from "react";
import { Button, Card } from "react-bootstrap";

export default function ClaimRewardTab() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await claimMiningReward();
      setResult(res);
    } catch (err) {
      alert(err?.response?.data?.error || "Gagal klaim reward.");
    }
    setLoading(false);
  };

  return (
    <Card bg="dark" text="white" className="p-4">
      <h5 className="mb-3">Klaim Reward Mining</h5>
      <Button onClick={handleClaim} disabled={loading}>
        {loading ? "Memproses..." : "Klaim Sekarang"}
      </Button>

      {result && (
        <div className="mt-4">
          <p><strong>Berhasil klaim!</strong></p>
          <p>Grup diklaim: {result.rewardGroups}</p>
          <p>SBP: {result.rewards.SBP}</p>
          <p>TBP: {result.rewards.TBP}</p>
        </div>
      )}
    </Card>
  );
}
