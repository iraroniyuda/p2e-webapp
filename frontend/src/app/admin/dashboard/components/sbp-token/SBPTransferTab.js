"use client";

import {
  deductSbpFromUser,
  getAllUsers,
  getSbpAllocationSummary,
  listSbpUsers,
  transferSbpToUser,
} from "@/services/apiClient";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Spinner,
  Table,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";

const formatNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) ? new Intl.NumberFormat("id-ID").format(num) : "";
};


const parseNumber = (value) =>
  Number(String(value || "").replace(/\./g, "").replace(/,/g, ""));

export default function SBPTransferTab() {
  const [mode, setMode] = useState("transfer"); // "transfer" | "deduct"
  const [userList, setUserList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [pagination, setPagination] = useState({
    data: [],
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
  });

  // Ambil saldo user yg dipilih (mode deduct)
  const selectedUserBalance =
    mode === "deduct" && selectedUserId
      ? pagination.data.find((u) => String(u.userId) === String(selectedUserId))?.balance ?? null
      : null;

  useEffect(() => {
    loadInitialData();
  }, [pagination.page]);

  const loadInitialData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [users, balancePage, categories] = await Promise.all([
        getAllUsers(),
        listSbpUsers(pagination.page, pagination.limit),
        getSbpAllocationSummary(),
      ]);

      setUserList(users);
      setCategoryList(categories.map((c) => c.category));
      setPagination((prev) => ({ ...prev, ...balancePage }));
    } catch (err) {
      console.error("❌ Load data error:", err);
      setErrorMessage("Gagal memuat data. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const amount = parseNumber(amountInput);
    if (!selectedUserId || !selectedCategory || !amount || amount <= 0) {
      setErrorMessage("Harap lengkapi semua input dan isi jumlah yang valid.");
      return;
    }

    if (mode === "deduct" && selectedUserBalance !== null && amount > selectedUserBalance) {
      setErrorMessage("Jumlah melebihi saldo SBP user.");
      return;
    }

    try {
      if (mode === "transfer") {
        await transferSbpToUser(selectedUserId, amount, selectedCategory);
        setSuccessMessage("✅ S-BP berhasil ditransfer ke user.");
      } else {
        await deductSbpFromUser(selectedUserId, amount, selectedCategory, noteInput);
        setSuccessMessage("✅ S-BP berhasil dikurangi dari user.");
      }

      setSelectedUserId("");
      setSelectedCategory("");
      setAmountInput("");
      setNoteInput("");
      loadInitialData();
    } catch (err) {
      console.error("❌ Action error:", err);
      setErrorMessage("Gagal memproses permintaan.");
    }
  };

  const changePage = (delta) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(prev.page + delta, prev.totalPages)),
    }));
  };

  if (loading) {
    return (
      <div className="text-white text-center">
        <Spinner animation="border" variant="light" />
        <p className="mt-2">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="text-white">
      <Row>
        {/* FORM TRANSFER / DEDUCT */}
        <Col md={6}>
          <Card className="bg-dark text-white mb-4">
            <Card.Body>
              <h4>{mode === "transfer" ? "Transfer SBP ke User" : "Kurangi SBP dari User"}</h4>

              <ToggleButtonGroup
                type="radio"
                name="mode"
                value={mode}
                onChange={setMode}
                className="mb-3"
              >
                <ToggleButton id="radio-transfer" variant="outline-light" value="transfer">
                  Transfer
                </ToggleButton>
                <ToggleButton id="radio-deduct" variant="outline-light" value="deduct">
                  Deduct
                </ToggleButton>
              </ToggleButtonGroup>

              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>Pilih User</Form.Label>
                <Form.Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- pilih user --</option>
                  {userList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {mode === "deduct" && selectedUserBalance !== null && (
                <div className="mb-3 text-info">
                  Saldo S-BP saat ini: <strong>{formatNumber(selectedUserBalance)}</strong>
                </div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>{mode === "transfer" ? "Dari Kategori" : "Masuk ke Kategori"}</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">-- pilih kategori --</option>
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Jumlah S-BP</Form.Label>
                <Form.Control
                  type="text"
                  value={formatNumber(amountInput)}
                  onChange={(e) => setAmountInput(parseNumber(e.target.value))}
                  placeholder="Contoh: 10000"
                />
              </Form.Group>

              {mode === "deduct" && (
                <Form.Group className="mb-3">
                  <Form.Label>Catatan (Opsional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Contoh: Penalti abuse"
                  />
                </Form.Group>
              )}

              <Button variant="primary" onClick={handleAction}>
                {mode === "transfer" ? "Transfer ke User" : "Kurangi SBP dari User"}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* TABEL BALANCE */}
        <Col md={6}>
          <Card className="bg-dark text-white">
            <Card.Body>
              <h4>Daftar Balance User</h4>

              <Table striped bordered hover variant="dark" responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>S-BP</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.data.map((u, i) => (
                    <tr key={u.userId}>
                      <td>{(pagination.page - 1) * pagination.limit + i + 1}</td>
                      <td>{u.username || "-"}</td>
                      <td>{u.email || "-"}</td>
                      <td className="text-end">{formatNumber(u.balance ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <Button
                  variant="secondary"
                  onClick={() => changePage(-1)}
                  disabled={pagination.page <= 1}
                >
                  ⬅ Prev
                </Button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => changePage(1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next ➡
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
