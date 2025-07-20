"use client";
import { useState } from "react";

export default function LeaderboardTable() {
  const [filter, setFilter] = useState("Total Points");

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div className="container mt-5 text-white">
      <h2 className="mb-3">Leaderboard</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="input-group">
          <select className="form-select" value={filter} onChange={handleFilterChange}>
            <option value="Total Points">Total Points</option>
            <option value="Total Races">Total Races</option>
            <option value="Total Wins">Total Wins</option>
          </select>
          <button className="btn btn-primary">Apply Filter</button>
        </div>
      </div>

      <table className="table table-striped">
        <thead className="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Username</th>
            <th scope="col">Total Races</th>
            <th scope="col">Total Wins</th>
            <th scope="col">Total Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="5" className="text-center text-muted">
              No data available. Start racing to appear on the leaderboard.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
