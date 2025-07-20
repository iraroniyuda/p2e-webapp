"use client";

export default function DashboardContent({
  user,
  wallet,
  referralCode,
  referralLink,
  downlines,
  upline,
  connectWallet,
  createReferralCode,
  error,
  loading,
  customReferral,
  setCustomReferral
}) {
  return (
    <div className="container mt-5">
      <div className="card shadow-sm p-4 rounded-4">
        <h2 className="text-center mb-4">Dashboard</h2>
        <div className="mb-3">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Racing Level:</strong> {user.racingLevel}</p>
          <p><strong>Connected Wallet:</strong> {wallet || "Not Connected"}</p>
        </div>

        <div className="mb-4">
          <h4>Sistem Referral</h4>
          {referralCode ? (
            <>
              <p><strong>Your Referral Code:</strong> {referralCode}</p>
              <div className="input-group mb-2">
                <input type="text" className="form-control" value={referralLink} readOnly />
                <button className="btn btn-outline-primary" onClick={() => navigator.clipboard.writeText(referralLink)}>
                  Copy Link
                </button>
              </div>
            </>
          ) : (
            <div className="mb-3">
              <h5>Create Your Referral Code</h5>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter custom referral code (4-8 characters)"
                  value={customReferral}
                  onChange={(e) => setCustomReferral(e.target.value.toUpperCase())}
                />
                <button
                  className="btn btn-primary"
                  onClick={createReferralCode}
                  disabled={loading || customReferral.length < 4 || customReferral.length > 8}
                >
                  {loading ? "Creating..." : "Create Referral"}
                </button>
              </div>
              {error && <div className="alert alert-danger mt-2">{error}</div>}
            </div>
          )}

          <h5 className="mt-3">Your Upline</h5>
          <p>{upline || "Tidak Ada Upline"}</p>

          <h5>Your Downlines</h5>
          {downlines.length > 0 ? (
            <ul className="list-group">
              {downlines.map((downline, index) => (
                <li key={index} className="list-group-item">{downline}</li>
              ))}
            </ul>
          ) : (
            <p>Tidak Ada Downlines</p>
          )}
        </div>

        <button className="btn btn-primary mt-4" onClick={connectWallet}>
          {wallet ? "Wallet Connected" : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}
