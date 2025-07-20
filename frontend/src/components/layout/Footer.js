"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  // Ambil lang dari localStorage
  const [lang, setLang] = useState("id");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      copyright: "© 2025 PT Cahaya Gerbang Mutiara. Seluruh Hak Cipta Dilindungi.",
      privacy: "Kebijakan Privasi",
      terms: "Syarat & Ketentuan",
      contact: "Hubungi Kami",
    },
    en: {
      copyright: "© 2025 PT Cahaya Gerbang Mutiara. All Rights Reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact Us",
    },
  };

  return (
    <footer
      className="d-flex flex-column align-items-center text-center py-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "#fff",
        width: "100%",
        fontSize: "1rem",
        padding: "2rem 0",
      }}
    >
      <p className="mb-2">{labels[lang].copyright}</p>
      <div className="footer-links">
        <Link href="/privacy" className="text-white text-decoration-none mx-3">
          {labels[lang].privacy}
        </Link>
        <span className="d-none d-md-inline">|</span>
        <Link href="/terms" className="text-white text-decoration-none mx-3">
          {labels[lang].terms}
        </Link>
        <span className="d-none d-md-inline">|</span>
        <Link href="/contact" className="text-white text-decoration-none mx-3">
          {labels[lang].contact}
        </Link>
      </div>
      <style jsx>{`
        .footer-links {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
        }
        .footer-links a {
          margin: 0.5rem 0.75rem;
          white-space: nowrap;
        }
        @media (max-width: 600px) {
          .footer-links {
            flex-direction: column;
          }
          .footer-links span {
            display: none !important;
          }
        }
      `}</style>
    </footer>
  );
}
