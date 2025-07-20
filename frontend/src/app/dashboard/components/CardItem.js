// CardItem.js
"use client";
import { Card } from "react-bootstrap";

export default function CardItem({ title, description, icon }) {
  return (
    <Card className="shadow-sm rounded p-3 d-flex align-items-center" style={{ width: "18rem", backdropFilter: "blur(10px)", backgroundColor: "rgba(255, 255, 255, 0.6)", padding: "12px 16px" }}>
      <div className="d-flex justify-content-between align-items-center w-100">
        <div className="text-start" style={{ flexGrow: 1, paddingRight: "8px" }}>
          <h5 className="mb-1">{title}</h5>
          <p className="text-muted mb-0">{description}</p>
        </div>
        <img src={icon} alt="Icon" style={{ width: "48px", height: "48px", marginLeft: "auto" }} />
      </div>
    </Card>
  );
}
