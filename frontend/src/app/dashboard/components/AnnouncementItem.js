"use client";
import { Card } from "react-bootstrap";

export default function AnnouncementItem({ title, date, content, titleColor, dateColor, contentColor }) {
  return (
    <Card 
      className="shadow-sm rounded" 
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: contentColor || "#FFFFFF",
        border: "none",
      }}
    >
      <Card.Body>
        <h5 className="fw-bold" style={{ color: titleColor || "#FFFFFF" }}>{title}</h5>
        <p className="mb-1" style={{ color: dateColor || "#CCCCCC" }}>{date}</p>
        <p style={{ color: contentColor || "#FFFFFF" }}>{content}</p>
      </Card.Body>
    </Card>
  );
}
