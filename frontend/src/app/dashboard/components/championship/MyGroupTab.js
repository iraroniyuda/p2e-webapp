"use client";

import { getMyChampionshipGroups, markParticipantReady } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";

export default function MyGroupTab() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const result = await getMyChampionshipGroups();
      setGroups(result);
    } catch (err) {
      console.error("❌ Gagal fetch grup saya", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async (groupId) => {
    setUpdatingId(groupId);
    try {
      await markParticipantReady(groupId);
      await fetchGroups();
    } catch (err) {
      console.error("❌ Gagal update ready status", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Spinner animation="border" />
      </div>
    );
  }

  if (groups.length === 0) {
    return <p className="text-white">Kamu belum tergabung dalam grup apapun.</p>;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-light">Grup Saya</h3>
      <div className="space-y-4">
        {groups.map((group) => {
          const myMember = group.members.find((m) => m.userId === group.myUserId);
          const isMyselfReady = myMember?.isReady;

          return (
            <div key={group.id} className="p-4 bg-white text-black rounded-xl shadow">
              <div className="font-bold text-xl text-gray-800">
                {group.phase.toUpperCase()} - Grup {group.groupNumber}
              </div>
              <div className="text-sm text-gray-600 mt-1 mb-3">
                Match ID: {group.id}, Championship ID: {group.championshipId}
              </div>

              <div>
                <div className="font-semibold text-gray-800 mb-1">Anggota:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {group.members.map((m) => (
                    <li key={m.user.id}>
                      {m.user.username} ({m.user.email})
                      {m.userId === group.myUserId && m.isReady && " ✅ Ready"}
                    </li>
                  ))}
                </ul>
              </div>

              {!isMyselfReady && (
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => handleMarkReady(group.id)}
                  disabled={updatingId === group.id}
                >
                  {updatingId === group.id ? "Updating..." : "Tandai Saya Siap"}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
