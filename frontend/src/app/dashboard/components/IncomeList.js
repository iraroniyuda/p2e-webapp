"use client";
import { Table } from "react-bootstrap";

export default function IncomeList({ type }) {
  // Contoh data sementara
  const exampleData = {
    Referral: [
      { date: "2025-05-11", amount: "100 TBP", details: "Bonus dari referral user A" },
      { date: "2025-05-10", amount: "50 TBP", details: "Bonus dari referral user B" },
    ],
    Transaction: [
      { date: "2025-05-11", amount: "10 TBP", details: "Komisi transaksi user A" },
      { date: "2025-05-10", amount: "20 TBP", details: "Komisi transaksi user B" },
    ],
    Racing: [
      { date: "2025-05-11", amount: "200 TBP", details: "Menang balapan kejuaraan" },
    ],
    Circuit: [
      { date: "2025-05-11", amount: "500 TBP", details: "Royalty penyewaan sirkuit user A" },
    ],
    Staking: [
      { date: "2025-05-11", amount: "150 TBP", details: "Reward staking periode 1" },
    ],
    Airdrop: [
      { date: "2025-05-11", amount: "100 TBP", details: "Airdrop event" },
    ],
    Purchase: [
      { date: "2025-05-11", amount: "1000 TBP", details: "Pembelian TBP user A" },
    ],
  };

  const incomeData = exampleData[type] || [];

  return (
    <Table striped bordered hover size="sm" className="mt-3">
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Jumlah</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>
        {incomeData.length > 0 ? (
          incomeData.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.amount}</td>
              <td>{item.details}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="text-center">Belum ada data</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
