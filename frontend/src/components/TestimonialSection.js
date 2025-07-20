/*()
// src/components/TestimonialSection.js
import Image from "next/image";

export default function TestimonialSection({ testimonials = [] }) {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.4)",
      backdropFilter: "blur(10px)",
      padding: "2rem",
      width: "90%",
      maxWidth: "1200px",
      borderRadius: "16px",
    }}>
      <h3 className="fw-bold text-center mb-4">Apa Kata Pengguna Kami</h3>
      <div className="d-flex justify-content-between flex-wrap gap-4">
        {testimonials.map((t, idx) => (
          <div key={idx} className="card p-4 shadow-sm flex-grow-1 d-flex flex-column align-items-center text-center" style={{ maxWidth: "30%" }}>
            <Image
              src={t.mediaUrl}
              alt={t.title || `User ${idx + 1}`}
              width={80}
              height={80}
              className="rounded-circle mb-3"
            />
            <p className="fw-bold mb-1">{t.title}</p>
            <p className="text-muted mb-0">"{t.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

*/

"use client";
import Image from "next/image";

export default function TestimonialSection() {
  return (
    <div style={{
      background: "rgba(255, 255, 255, 0.4)",
      backdropFilter: "blur(10px)",
      padding: "2rem",
      width: "90%",
      maxWidth: "1200px",
      borderRadius: "16px",
    }}>
      <h3 className="fw-bold text-center mb-4">What Our Users Say</h3>
      <div className="d-flex justify-content-between flex-wrap gap-4">
        {/* Testimonial 1 */}
        <div className="card p-4 shadow-sm flex-grow-1 d-flex flex-column align-items-center text-center" style={{ maxWidth: "30%" }}>
          <Image
            src="/images/user1.png"
            alt="User 1"
            width={80}
            height={80}
            className="rounded-circle mb-3"
          />
          <p className="fw-bold mb-1">John Doe</p>
          <p className="text-muted mb-0">"This game is so much fun, the system is fair, and the rewards are real!"</p>
        </div>

        {/* Testimonial 2 */}
        <div className="card p-4 shadow-sm flex-grow-1 d-flex flex-column align-items-center text-center" style={{ maxWidth: "30%" }}>
          <Image
            src="/images/user2.png"
            alt="User 2"
            width={80}
            height={80}
            className="rounded-circle mb-3"
          />
          <p className="fw-bold mb-1">Jane Smith</p>
          <p className="text-muted mb-0">"TBP Race delivers a brand new experience in racing games!"</p>
        </div>

        {/* Testimonial 3 */}
        <div className="card p-4 shadow-sm flex-grow-1 d-flex flex-column align-items-center text-center" style={{ maxWidth: "30%" }}>
          <Image
            src="/images/user3.png"
            alt="User 3"
            width={80}
            height={80}
            className="rounded-circle mb-3"
          />
          <p className="fw-bold mb-1">Michael Johnson</p>
          <p className="text-muted mb-0">"I love the token system – it’s safe and rewarding."</p>
        </div>
      </div>
    </div>
  );
}
