"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import AdminSidebar from "../components/AdminSidebar";

export default function StakingAndAirdropPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Dummy Data untuk Paket Staking
  const [stakingPackages, setStakingPackages] = useState([
    { id: 1, amount: "1000 TBP", duration: "30 hari", interest: "5%" },
    { id: 2, amount: "5000 TBP", duration: "60 hari", interest: "10%" },
  ]);

  // Dummy Data untuk Daftar Pengguna Staking
  const stakingUsers = [
    { username: "User A", amount: "1000 TBP", duration: "30 hari", status: "Active" },
    { username: "User B", amount: "5000 TBP", duration: "60 hari", status: "Completed" },
  ];

  // Dummy Data untuk Airdrop
  const [airdropEvents, setAirdropEvents] = useState([
    { id: 1, title: "Airdrop New Year", target: "All Users", amount: "5000 TBP" },
    { id: 2, title: "Exclusive Airdrop", target: "Top Referrers", amount: "2000 TBP" },
  ]);

  // State untuk Modal Tambah/Edit Staking
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [isEditStaking, setIsEditStaking] = useState(false);
  const [selectedStaking, setSelectedStaking] = useState(null);
  const [stakingData, setStakingData] = useState({
    amount: "",
    duration: "",
    interest: "",
  });

  // State untuk Modal Tambah/Edit Airdrop
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [airdropData, setAirdropData] = useState({
    title: "",
    target: "",
    amount: "",
  });

  const handleOpenStakingModal = (staking = null) => {
    setIsEditStaking(!!staking);
    setSelectedStaking(staking);
    setStakingData(staking || { amount: "", duration: "", interest: "" });
    setShowStakingModal(true);
  };

  const handleSaveStaking = () => {
    if (isEditStaking && selectedStaking) {
      setStakingPackages((prev) =>
        prev.map((pkg) => (pkg.id === selectedStaking.id ? { ...pkg, ...stakingData } : pkg))
      );
      alert("Paket Staking berhasil diubah.");
    } else {
      setStakingPackages((prev) => [
        ...prev,
        { id: Date.now(), ...stakingData },
      ]);
      alert("Paket Staking berhasil ditambahkan.");
    }
    setShowStakingModal(false);
  };

  const handleDeleteStaking = (id) => {
    setStakingPackages((prev) => prev.filter((pkg) => pkg.id !== id));
    alert("Paket Staking berhasil dihapus.");
  };

  const handleOpenAirdropModal = () => {
    setShowAirdropModal(true);
    setAirdropData({ title: "", target: "", amount: "" });
  };

  const handleSaveAirdrop = () => {
    setAirdropEvents((prev) => [
      ...prev,
      { id: Date.now(), ...airdropData },
    ]);
    alert("Airdrop berhasil ditambahkan.");
    setShowAirdropModal(false);
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/bg-dashboard.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <AdminSidebar />
      <div className="flex-grow-1 p-4 text-white">
        <h1>Manajemen Staking & Airdrop</h1>

        {/* Section 1: Pengaturan Staking */}
        <div className="mb-4">
          <h2>Pengaturan Staking</h2>
          <Button variant="primary" className="mb-3" onClick={() => handleOpenStakingModal()}>
            Tambah Paket Staking
          </Button>
          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Jumlah</th>
                <th>Durasi</th>
                <th>Bunga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {stakingPackages.map((pkg) => (
                <tr key={pkg.id}>
                  <td>{pkg.amount}</td>
                  <td>{pkg.duration}</td>
                  <td>{pkg.interest}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={() => handleOpenStakingModal(pkg)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteStaking(pkg.id)}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Section 2: Daftar Pengguna Staking */}
        <div className="mb-4">
          <h2>Daftar Pengguna Staking</h2>
          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Jumlah</th>
                <th>Durasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stakingUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.amount}</td>
                  <td>{user.duration}</td>
                  <td>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* Section 3: Pengaturan Airdrop */}
        <div className="mb-4">
          <h2>Pengaturan Airdrop</h2>
          <Button variant="primary" className="mb-3" onClick={handleOpenAirdropModal}>
            Tambah Event Airdrop
          </Button>
          <Table variant="light" striped bordered hover>
            <thead>
              <tr>
                <th>Judul</th>
                <th>Target</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {airdropEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.target}</td>
                  <td>{event.amount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal Tambah/Edit Staking */}
      <Modal show={showStakingModal} onHide={() => setShowStakingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditStaking ? "Edit Paket Staking" : "Tambah Paket Staking"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Jumlah Staking (TBP)</Form.Label>
              <Form.Control
                type="text"
                value={stakingData.amount}
                onChange={(e) => setStakingData({ ...stakingData, amount: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Durasi Staking</Form.Label>
              <Form.Control
                type="text"
                value={stakingData.duration}
                onChange={(e) => setStakingData({ ...stakingData, duration: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bunga (%)</Form.Label>
              <Form.Control
                type="text"
                value={stakingData.interest}
                onChange={(e) => setStakingData({ ...stakingData, interest: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStakingModal(false)}>Batal</Button>
          <Button variant="primary" onClick={handleSaveStaking}>Simpan</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
