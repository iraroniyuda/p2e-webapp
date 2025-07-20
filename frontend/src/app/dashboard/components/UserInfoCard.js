"use client";
import Link from "next/link";
import { Button, Card } from "react-bootstrap";

const formatUserLevel = (level) => {
  if (!level) return "-";
  const labelMap = {
    white: "White",
    green: "Green",
    blue: "Blue",
    double_blue: "Double Blue",
  };
  return labelMap[level] || level;
};

const formatExchangerLevel = (level) => {
  if (!level || level === "none") return "Bukan Exchanger";
  const labelMap = {
    mid: "Mid",
    senior: "Senior",
    executive: "Executive",
  };
  return labelMap[level] || level;
};

function ActivationOrKycButton({ userLevel, hasBoughtPackage, hasSubmittedKyc }) {
  if (userLevel !== "white") return null;

  return (
    <div className="mt-2">
      {!hasSubmittedKyc ? (
        <Link href="/dashboard/kyc" passHref>
          <Button variant="success" size="sm">Isi Data KYC</Button>
        </Link>
      ) : !hasBoughtPackage ? (
        <Link href="/dashboard/transaction" passHref>
          <Button variant="success" size="sm">Upgrade Akun</Button>
        </Link>
      ) : (
        <Link href="/dashboard/balance" passHref>
          <Button variant="success" size="sm">Lanjutkan Aktivasi</Button>
        </Link>
      )}
    </div>
  );
}

export default function UserInfoCard({ user, userActivationProgress, hasSubmittedKyc }) {
  const hasBoughtPackage = Array.isArray(userActivationProgress)
    ? userActivationProgress.length > 0
    : !!userActivationProgress;

  return (
    <Card
      className="shadow-sm rounded p-4 mb-4"
      style={{
        maxWidth: 450,
        width: "100%",
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255,255,255,0.85)",
      }}
    >
      <h4 className="fw-bold mb-3">Informasi Pengguna</h4>

      <div className="mb-2">
        <strong>Username:</strong> {user?.username || "-"}
      </div>
      <div className="mb-2">
        <strong>Email:</strong> {user?.email || "-"}
      </div>
      <div className="mb-2">
        <strong>Role:</strong> {user?.role || "-"}
      </div>

      <div className="mb-2">
        <strong>User Level:</strong> {formatUserLevel(user?.userLevel)}
        <ActivationOrKycButton
          userLevel={user?.userLevel}
          hasBoughtPackage={hasBoughtPackage}
          hasSubmittedKyc={hasSubmittedKyc}
        />
      </div>

      <div className="mb-2">
        <strong>Exchanger Level:</strong>{" "}
        {user?.isCompanyExchanger
          ? "Company Exchanger"
          : formatExchangerLevel(user?.exchangerLevel)}
      </div>
    </Card>
  );
}
