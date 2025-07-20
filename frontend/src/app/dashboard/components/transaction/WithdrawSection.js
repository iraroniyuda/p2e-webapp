"use client";
import axios from "axios";
import { useState } from "react";

export default function WithdrawSection() {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount) {
      setMessage("Please enter amount.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/payment/user/withdraw", {
        amount: parseFloat(amount),
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      setMessage("Withdrawal request sent. Please wait for processing.");
    } catch (error) {
      setMessage("Failed to process withdrawal.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Withdrawal</h2>
      <form onSubmit={handleWithdraw} className="mb-4">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded w-full mb-2"
        />
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded" disabled={loading}>
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </form>
      {message && <div className="text-red-500">{message}</div>}
    </div>
  );
}
