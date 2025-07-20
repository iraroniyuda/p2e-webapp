import { getAllPolClaimHistories } from "@/services/apiClient";
import { useCallback, useEffect, useState } from "react";
import { Form, Pagination, Spinner, Table } from "react-bootstrap";

export default function PolClaimHistoryTab() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [levelName, setLevelName] = useState("");

  // Fetch data function
  const fetchData = useCallback(async (customPage = page, customLimit = limit) => {
    setLoading(true);
    try {
      const params = {};
      if (username) params.username = username;
      if (email) params.email = email;
      if (levelName) params.levelName = levelName;
      params.page = customPage;
      params.limit = customLimit;

      const res = await getAllPolClaimHistories(params);
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      alert("Gagal mengambil data POL Claim History");
    }
    setLoading(false);
    // eslint-disable-next-line
  }, [username, email, levelName, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData, page, limit]);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData(1, limit);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <h4 className="mb-3 text-dark">Riwayat Klaim POL</h4>
      <Form className="mb-3" onSubmit={handleFilter}>
        <div className="d-flex gap-2 flex-wrap">
          <Form.Control
            placeholder="Username"
            size="sm"
            style={{ width: 120 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Form.Control
            placeholder="Email"
            size="sm"
            style={{ width: 170 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Control
            placeholder="Level Name"
            size="sm"
            style={{ width: 120 }}
            value={levelName}
            onChange={(e) => setLevelName(e.target.value)}
          />
          <button className="btn btn-secondary btn-sm" type="submit">
            Filter
          </button>
        </div>
      </Form>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Table striped bordered hover responsive size="sm" className="bg-white">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Paket</th>
                <th>Nominal POL</th>
                <th>Tgl Klaim</th>
                <th>TxHash</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted">Tidak ada data</td>
                </tr>
              ) : data.map((row, idx) => (
                <tr key={row.id}>
                  <td>{(page - 1) * limit + idx + 1}</td>
                  <td>{row.user?.username || "-"}</td>
                  <td>{row.user?.email || "-"}</td>
                  <td>{row.levelName}</td>
                  <td>{row.amountPOL?.toString()}</td>
                  <td>{row.claimedAt && new Date(row.claimedAt).toLocaleString()}</td>
                  <td>
                    {row.txHash && row.txHash !== "-" ? (
                      <a
                        href={`https://polygonscan.com/tx/${row.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-info"
                        style={{ fontSize: 11 }}
                      >
                        {row.txHash.substring(0, 10)}...
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center">
            <span>
              Total: <b>{total}</b>
            </span>
            <Pagination size="sm">
              <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
              <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />
              {[...Array(totalPages).keys()].map((n) => (
                <Pagination.Item
                  key={n + 1}
                  active={page === n + 1}
                  onClick={() => setPage(n + 1)}
                >
                  {n + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => setPage(page + 1)} disabled={page === totalPages} />
              <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}
