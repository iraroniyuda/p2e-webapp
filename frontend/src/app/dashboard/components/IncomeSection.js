"use client";
import { Card } from "react-bootstrap";
import IncomeList from "./IncomeList";

export default function IncomeSection() {
  return (
    <div className="container mt-5 text-white">
      <h3 className="mb-4">Pendapatan TBP</h3>
      <div className="row g-4">
        {/* Income dari Referral */}
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Bonus Referral Daftar</Card.Title>
              <IncomeList type="Referral" />
            </Card.Body>
          </Card>
        </div>

        {/* Income dari Komisi Transaksi */}
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Komisi Transaksi</Card.Title>
              <IncomeList type="Transaction" />
            </Card.Body>
          </Card>
        </div>

        {/* Income dari Menang Balapan */}
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Income dari Menang Balapan</Card.Title>
              <IncomeList type="Racing" />
            </Card.Body>
          </Card>
        </div>

        {/* Royalty Penyewaan Sirkuit */}
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Royalty Penyewaan Sirkuit</Card.Title>
              <IncomeList type="Circuit" />
            </Card.Body>
          </Card>
        </div>

        {/* Income dari Staking */}
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Income dari Staking</Card.Title>
              <IncomeList type="Staking" />
            </Card.Body>
          </Card>
        </div>

        {/* Income dari Airdrop */}
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Income dari Airdrop</Card.Title>
              <IncomeList type="Airdrop" />
            </Card.Body>
          </Card>
        </div>

        {/* Income dari Pembelian TBP */}
        <div className="col-md-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Income dari Pembelian TBP</Card.Title>
              <IncomeList type="Purchase" />
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
