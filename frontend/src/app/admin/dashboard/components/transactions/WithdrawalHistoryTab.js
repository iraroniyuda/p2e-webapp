import { getAllWithdrawalHistory } from "@/services/apiClient";
import { useEffect, useState } from "react";
import { Button, Col, Form, Row, Spinner, Table } from "react-bootstrap";

// Helper untuk ambil nama BANK dari responseDesc
function extractBankName(desc) {
  if (!desc) return "";
  const match = desc.match(/BENEFBANK:([^,]+)/i);
  if (match) return match[1].trim();
  return "";
}

// Helper untuk ambil nama akun (BENEFNAME) dari responseDesc
function extractAccountName(desc) {
  if (!desc) return "";
  const match = desc.match(/BENEFNAME:([^,]+)/i);
  if (match) return match[1].trim();
  return "";
}

function extractNoRekening(desc) {
  if (!desc) return "";
  const match = desc.match(/BENEFACCOUNT:([0-9]{5,})/i);
  if (match) return match[1];
  // Fallback jika format di awal: BANKCODE.REKENING@ atau .REKENING SPASI
  const match2 = desc.match(/[A-Z]+\.([0-9]{5,})@/);
  if (match2) return match2[1];
  return "";
}


// Format rupiah dengan separator dan prefix Rp
function formatRupiah(value) {
  if (!value) return "-";
  const num = typeof value === "number" ? value : value.toString().replace(/\D/g, "");
  if (!num) return "-";
  return "Rp " + Number(num).toLocaleString("id-ID");
}

export default function WithdrawalHistoryTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  // Optional filter
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (username) params.username = username;
      if (email) params.email = email;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await getAllWithdrawalHistory(params);
      setData(res.data);
    } catch (e) {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-white">Riwayat Withdrawal</h2>
      <Form className="mb-3" onSubmit={e => { e.preventDefault(); fetchData(); }}>
        <Row className="g-2">
          <Col md={2}><Form.Control placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /></Col>
          <Col md={2}><Form.Control placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /></Col>
          <Col md={2}><Form.Control type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></Col>
          <Col md={2}><Form.Control type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></Col>
          <Col md={2}><Button type="submit" variant="success">Filter</Button></Col>
        </Row>
      </Form>
      {loading ? (
        <div className="text-center py-4"><Spinner /></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>No.</th>
                <th>Username</th>
                <th>Email</th>
                <th>No. Rekening</th>
                <th>Nama Akun</th>
                <th>Bank</th>
                <th>Nominal Transfer</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr><td colSpan={8} className="text-center">Belum ada data.</td></tr>
              )}
              {data.map((trx, i) => (
                <tr key={trx.id}>
                  <td>{i + 1}</td>
                  <td>{trx.username}</td>
                  <td>{trx.email}</td>
                  <td>{extractNoRekening(trx.responseDesc)}</td>
                  <td>{extractAccountName(trx.responseDesc)}</td>
                  <td>{extractBankName(trx.responseDesc)}</td>
                  <td style={{ textAlign: "right" }}>
                  <b>{formatRupiah(trx.nominalDariDesc)}</b>
                  </td>
                  <td>{new Date(trx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
