"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PrivacyPolicy() {
  const [lang, setLang] = useState("id");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      title: "Kebijakan Privasi",
      lastUpdate: "Terakhir diperbarui: Mei 2025",
      welcome: "Selamat datang di . Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan kami.",
      sections: [
        {
          h: "1. Informasi yang Kami Kumpulkan",
          p: "Kami dapat mengumpulkan informasi seperti nama, alamat email, alamat wallet, dan data penggunaan saat Anda berinteraksi dengan platform kami."
        },
        {
          h: "2. Bagaimana Kami Menggunakan Informasi Anda",
          p: "Informasi Anda digunakan untuk menyediakan, meningkatkan, dan mempersonalisasi layanan kami, serta untuk berkomunikasi dan menjaga keamanan platform."
        },
        {
          h: "3. Berbagi Informasi Anda",
          p: "Kami tidak membagikan data pribadi Anda ke pihak ketiga, kecuali jika diwajibkan oleh hukum atau untuk melindungi hak kami."
        },
        {
          h: "4. Keamanan Data",
          p: "Kami menerapkan langkah keamanan yang wajar untuk melindungi data Anda dari akses, perubahan, atau pengungkapan yang tidak sah."
        },
        {
          h: "5. Hak Anda",
          p: "Anda berhak untuk mengakses, memperbarui, atau menghapus data pribadi Anda. Silakan hubungi kami untuk bantuan lebih lanjut."
        },
        {
          h: "6. Perubahan atas Kebijakan Privasi Ini",
          p: "Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Silakan tinjau secara berkala."
        }
      ],
      contact: "Hubungi Kami",
      question: "Jika Anda memiliki pertanyaan, silakan hubungi kami melalui email di",
      back: "Kembali ke Beranda"
    },
    en: {
      title: "Privacy Policy",
      lastUpdate: "Last updated: May 2025",
      welcome: "Welcome to . This Privacy Policy explains how we collect, use, and protect your personal information when using our services.",
      sections: [
        {
          h: "1. Information We Collect",
          p: "We may collect information such as your name, email address, wallet address, and usage data when you interact with our platform."
        },
        {
          h: "2. How We Use Your Information",
          p: "Your information is used to provide, improve, and personalize our services, as well as to communicate with you and maintain the security of our platform."
        },
        {
          h: "3. Sharing Your Information",
          p: "We do not share your personal information with third parties, unless required by law or to protect our rights."
        },
        {
          h: "4. Data Security",
          p: "We implement reasonable security measures to protect your information from unauthorized access, alteration, or disclosure."
        },
        {
          h: "5. Your Rights",
          p: "You have the right to access, update, or delete your personal information. Contact us for further assistance."
        },
        {
          h: "6. Changes to This Privacy Policy",
          p: "We may update this Privacy Policy from time to time. Please review it periodically."
        }
      ],
      contact: "Contact Us",
      question: "If you have any questions, please contact us via email at",
      back: "Back to Home"
    }
  };

  const t = labels[lang];

  return (
    <div className="container mt-5 mb-5 p-4 rounded-4 shadow-lg" 
         style={{ backgroundColor: "#f8f9fa", maxWidth: "800px" }}>
      <h2 className="mb-4 text-center" style={{ fontWeight: "bold", color: "#333" }}>{t.title}</h2>
      <p className="text-center text-muted">{t.lastUpdate}</p>
      <hr />

      <p className="mt-3">{t.welcome}</p>
      {t.sections.map((s, idx) => (
        <div key={idx}>
          <h4 className="mt-4" style={{ fontWeight: "600" }}>{s.h}</h4>
          <p>{s.p}</p>
        </div>
      ))}

      <h4 className="mt-4" style={{ fontWeight: "600" }}>{t.contact}</h4>
      <p>
        {t.question}
        <Link href="mailto:" className="text-decoration-none text-primary"></Link>.
      </p>

      <div className="text-center mt-5">
        <Link href="/" className="btn btn-primary rounded-pill px-4 py-2">
          {t.back}
        </Link>
      </div>
    </div>
  );
}
