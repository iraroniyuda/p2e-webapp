"use client";

import {
  completeChampionshipFinal,
  getAllChampionships,
  getGrandFinalWinnersPreview,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";

export default function FinishChampionshipTab() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [doneIds, setDoneIds] = useState([]);
  const [winnersPreview, setWinnersPreview] = useState({});
  const [winnersFinal, setWinnersFinal] = useState({}); // Untuk hasil setelah finalize

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all championship
  const fetchData = async () => {
    try {
      const data = await getAllChampionships();
      const unfinished = data.filter(
        (ch) => ch.status !== "finished" && ch.status !== "pending"
      );
      setChampionships(unfinished);

      // Fetch preview juara grand_final untuk setiap championship
      for (const ch of unfinished) {
        fetchWinnersPreview(ch.id);
      }
    } catch (err) {
      console.error("❌ Gagal ambil championship", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch preview juara grand final dari backend
  const fetchWinnersPreview = async (championshipId) => {
    try {
      const res = await getGrandFinalWinnersPreview(championshipId);
      setWinnersPreview((prev) => ({
        ...prev,
        [championshipId]: res,
      }));
    } catch (err) {
      setWinnersPreview((prev) => ({
        ...prev,
        [championshipId]: {},
      }));
      // Silent, biar tetap jalan
    }
  };

  // Handle selesai championship
  const handleFinish = async (championshipId) => {
    try {
      setProcessingId(championshipId);
      const result = await completeChampionshipFinal(championshipId);

      setWinnersFinal((prev) => ({
        ...prev,
        [championshipId]: result.juara,
      }));

      const juaraText = result.juara
        .map(
          (j) =>
            `Juara ${j.position}: ${j.username || j.user?.username || j.userId} (${j.email || j.user?.email || "-"})`
        )
        .join("\n");

      alert(`🏁 Championship selesai!\n\n${juaraText}`);
      setDoneIds((prev) => [...prev, championshipId]);
    } catch (err) {
      console.error("❌ Gagal menyelesaikan championship", err);
      alert("❌ Gagal: " + (err?.response?.data?.error || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Selesaikan Championship</h3>

      {championships.length === 0 ? (
        <p className="text-white">Tidak ada championship yang aktif.</p>
      ) : (
        <div className="space-y-4">
          {championships.map((ch) => {
            const preview = winnersPreview[ch.id] || {};
            const juaraPreview = preview.winners || [];
            const ownerUsername = preview.ownerUsername || "-";
            const ownerEmail = preview.ownerEmail || "-";
            const royaltyAmount = preview.royaltyAmount || 0;
            const royaltyCurrency = preview.royaltyCurrency || "";

            const juaraFinal = winnersFinal[ch.id];

            return (
              <div key={ch.id} className="p-4 bg-white shadow rounded text-black">
                <div className="font-bold text-lg mb-1">
                  {ch.request?.title || "(Tanpa Judul)"} — ID {ch.id}
                </div>
                <div className="text-sm mb-2">
                  Jadwal:{" "}
                  {ch.request?.scheduledAt
                    ? new Date(ch.request.scheduledAt).toLocaleString()
                    : "-"}
                </div>
                <Button
                  onClick={() => handleFinish(ch.id)}
                  disabled={processingId === ch.id || doneIds.includes(ch.id)}
                >
                  {processingId === ch.id
                    ? "Memproses..."
                    : doneIds.includes(ch.id)
                    ? "Sudah Selesai"
                    : "Selesaikan Championship"}
                </Button>

                {/* TAMPILKAN PREVIEW JUARA GRAND FINAL */}
                {juaraPreview.length > 0 && (
                  <div className="mt-3 border rounded p-3 bg-warning bg-opacity-10">
                    <div className="fw-bold mb-2 text-success">
                      Preview Juara Grand Final Championship:
                    </div>
                    <ol className="mb-0 ps-3">
                      {juaraPreview.map((j) => (
                        <li key={j.position}>
                          <b>Juara {j.position}:</b> {j.username || j.userId}{" "}
                          <small className="text-muted">
                            ({j.email || "-"})
                          </small>
                          {j.rewardAmount && (
                            <>
                              <br />
                              <span>
                                Reward:{" "}
                                <b>
                                  {parseFloat(j.rewardAmount).toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </b>{" "}
                                {j.rewardCurrency}
                              </span>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>
                    {/* ROYALTY PREVIEW */}
                    <div className="mt-2">
                      <hr className="my-2" />
                      <div>
                        <span className="fw-bold">
                          Royalti untuk Circuit Owner:
                        </span>
                        <br />
                        {ownerUsername === "-" ? (
                          <span>
                            <i>Tidak ada circuit owner</i>
                            <br />
                          </span>
                        ) : (
                          <span>
                            {ownerUsername}{" "}
                            <small className="text-muted">
                              ({ownerEmail})
                            </small>
                            <br />
                          </span>
                        )}
                        <span>
                          Nominal:{" "}
                          <b>
                            {parseFloat(royaltyAmount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </b>{" "}
                          {royaltyCurrency}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAMPILKAN JUARA FINAL JIKA SUDAH SELESAI */}
                {juaraFinal && (
                  <div className="mt-3 border rounded p-3 bg-success bg-opacity-10">
                    <div className="fw-bold mb-2 text-success">
                      🏆 Juara (Final):
                    </div>
                    <ol className="mb-0 ps-3">
                      {juaraFinal.map((j) => (
                        <li key={j.position} className="mb-1">
                          <b>Juara {j.position}:</b>{" "}
                          {j.username || j.user?.username || j.userId}{" "}
                          <small className="text-muted">
                            {j.email || j.user?.email || ""}
                          </small>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
