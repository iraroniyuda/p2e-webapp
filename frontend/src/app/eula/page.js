"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EULA() {
  const router = useRouter();
  const [lang, setLang] = useState("id");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      title: "Perjanjian Lisensi Pengguna Akhir (EULA)",
      p1: `Perjanjian Lisensi Pengguna Akhir ("EULA") ini adalah perjanjian hukum antara Anda dan . Dengan membuat akun atau menggunakan layanan kami, Anda setuju untuk terikat pada syarat-syarat dalam perjanjian ini.`,
      s1: "1. Lisensi",
      p2: "Anda diberikan lisensi terbatas, non-eksklusif, tidak dapat dipindahtangankan, dan dapat dicabut untuk mengakses dan menggunakan layanan kami hanya untuk keperluan pribadi, non-komersial.",
      s2: "2. Pembatasan",
      p3: "Anda tidak diperbolehkan:",
      l1: [
        "Membongkar, mendekompilasi, atau merekayasa balik bagian mana pun dari perangkat lunak.",
        "Mendistribusikan, mensublisensikan, menyewakan, atau meminjamkan akses Anda.",
        "Menggunakan platform untuk aktivitas ilegal atau perilaku merugikan."
      ],
      s3: "3. Pengakhiran",
      p4: "Akses Anda dapat dihentikan tanpa pemberitahuan jika Anda melanggar ketentuan dalam EULA ini.",
      s4: "4. Tanggung Jawab",
      p5: " tidak bertanggung jawab atas kerusakan yang timbul dari penggunaan platform oleh Anda.",
      s5: "5. Hukum yang Berlaku",
      p6: "Perjanjian ini diatur oleh hukum yang berlaku di [Negara/Wilayah Anda].",
      back: "Kembali ke Halaman Registrasi"
    },
    en: {
      title: "End User License Agreement (EULA)",
      p1: `This End User License Agreement ("EULA") is a legal agreement between you and. By creating an account or using our services, you agree to be bound by the terms of this agreement.`,
      s1: "1. License",
      p2: "You are granted a limited, non-exclusive, non-transferable, revocable license to access and use our services for personal, non-commercial use only.",
      s2: "2. Restrictions",
      p3: "You may not:",
      l1: [
        "Reverse engineer, decompile, or disassemble any part of the software.",
        "Distribute, sublicense, rent, or lease your access.",
        "Use the platform for illegal activities or harmful behavior."
      ],
      s3: "3. Termination",
      p4: "Your access may be terminated without notice if you violate any terms of this EULA.",
      s4: "4. Liability",
      p5: " is not responsible for any damages resulting from your use of the platform.",
      s5: "5. Governing Law",
      p6: "This agreement is governed by the laws of [Your Country/Region].",
      back: "Back to Registration"
    }
  };

  const t = labels[lang];

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">{t.title}</h2>
      <div className="card shadow-sm p-4 rounded-4">
        <p>{t.p1}</p>
        <h4>{t.s1}</h4>
        <p>{t.p2}</p>
        <h4>{t.s2}</h4>
        <p>{t.p3}</p>
        <ul>
          {t.l1.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
        <h4>{t.s3}</h4>
        <p>{t.p4}</p>
        <h4>{t.s4}</h4>
        <p>{t.p5}</p>
        <h4>{t.s5}</h4>
        <p>{t.p6}</p>
        <div className="text-center mt-4">
          <button className="btn btn-primary" onClick={() => router.back()}>
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
}
