"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TermsOfService() {
  const [lang, setLang] = useState("id");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      title: "Syarat & Ketentuan",
      lastUpdate: "Terakhir diperbarui: Mei 2025",
      welcome: "Selamat datang di . Dengan mengakses atau menggunakan platform kami, Anda setuju untuk mematuhi Syarat & Ketentuan ini.",
      sections: [
        {
          h: "1. Penerimaan Syarat",
          p: "Dengan menggunakan layanan kami, Anda setuju terhadap syarat ini. Jika tidak setuju, silakan jangan gunakan platform kami."
        },
        {
          h: "2. Tanggung Jawab Pengguna",
          p: "Anda bertanggung jawab menjaga keamanan akun Anda dan atas semua aktivitas yang terjadi di dalam akun tersebut."
        },
        {
          h: "3. Larangan Perilaku",
          p: "Anda tidak boleh menggunakan platform kami untuk aktivitas ilegal atau aktivitas yang melanggar hukum di wilayah Anda."
        },
        {
          h: "4. Hak Kekayaan Intelektual",
          p: "Seluruh konten di platform ini adalah milik  dan tidak boleh disalin tanpa izin."
        },
        {
          h: "5. Batasan Tanggung Jawab",
          p: " tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan platform ini."
        },
        {
          h: "6. Perubahan Syarat",
          p: "Kami dapat memperbarui Syarat & Ketentuan ini dari waktu ke waktu. Penggunaan platform yang berkelanjutan berarti Anda menerima perubahan tersebut."
        }
      ],
      contact: "Hubungi Kami",
      question: "Jika Anda memiliki pertanyaan, silakan hubungi kami melalui email di",
      back: "Kembali ke Beranda"
    },
    en: {
      title: "Terms of Service",
      lastUpdate: "Last updated: May 2025",
      welcome: "Welcome to . By accessing or using our platform, you agree to comply with these Terms of Service.",
      sections: [
        {
          h: "1. Acceptance of Terms",
          p: "By using our services, you agree to these terms. If you do not agree, please do not use our platform."
        },
        {
          h: "2. User Responsibilities",
          p: "You are responsible for maintaining the security of your account and for all activities that occur under your account."
        },
        {
          h: "3. Prohibited Conduct",
          p: "You may not use our platform for any illegal activity or any activity that violates the laws in your jurisdiction."
        },
        {
          h: "4. Intellectual Property Rights",
          p: "All content on this platform is the property of  and may not be copied without permission."
        },
        {
          h: "5. Limitation of Liability",
          p: " is not liable for any losses arising from the use of this platform."
        },
        {
          h: "6. Changes to the Terms",
          p: "We may update these Terms of Service from time to time. Continued use of the platform means you accept those changes."
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
        <Link href="mailto:" className="text-decoration-none text-primary"> </Link>.
      </p>

      <div className="text-center mt-5">
        <Link href="/" className="btn btn-primary rounded-pill px-4 py-2">
          {t.back}
        </Link>
      </div>
    </div>
  );
}
