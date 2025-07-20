"use client";
import Navbar from "@/components/layout/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function About() {
  // Ambil lang dari localStorage
  const [lang, setLang] = useState("id");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  // Semua label/materi
  const labels = {
    id: {
      title: "Tentang ",
      intro: [
        "adalah perusahaan inovatif di bidang gaming dan tokenomics berbasis web, fokus utama membangun ekosistem digital yang menggabungkan hiburan interaktif dan peluang ekonomi berbasis blockchain.",
        "Lewat platform kami, pengguna tidak hanya menikmati pengalaman bermain game yang seru dan kompetitif, tapi juga memperoleh manfaat ekonomi nyata melalui sistem reward yang transparan dan berkelanjutan.",
        "Kami percaya masa depan industri digital ada pada integrasi game, teknologi blockchain, dan komunitas yang saling mendukung."
      ],
      vision: "Visi",
      visionDesc: "Menjadi pelopor dalam transformasi digital dunia hiburan dan finansial.",
      mission: "Misi",
      missionList: [
        "Menyediakan platform gaming yang menyenangkan dan menarik.",
        "Memberikan nilai tambah finansial lewat teknologi token digital yang aman dan terpercaya.",
        "Membangun platform ekonomi digital yang berkelanjutan dan siap masa depan."
      ],
      features: "Fitur Utama",
      p2e: "Tokenomics P2E",
      p2eDesc: "Sistem ekonomi berbasis token yang memberi reward ke pemain yang bermain dan berkompetisi.",
      referral: "Referral Pintar",
      referralDesc: "Dapatkan komisi lewat sistem referral transparan penuh di blockchain.",
      championship: "Sistem Kejuaraan",
      championshipDesc: "Sistem kompetisi terstruktur, sewa sirkuit, dan hadiah token menarik.",
      multiverse: "Game Multiverse",
      multiverseDesc: "Menghubungkan berbagai game dalam satu platform dengan integrasi token yang aman dan seamless.",
      stayConnected: "Tetap Terhubung",
      follow: "Ikuti kami di media sosial untuk update terbaru dan info komunitas.",
      twitter: "Twitter",
      discord: "Discord",
      telegram: "Telegram"
    },
    en: {
      title: "About ",
      intro: [
        " is an innovative company engaged in the field of gaming and web-based tokenomics, with a primary focus on building a digital ecosystem that combines interactive entertainment and blockchain-based economic opportunities.",
        "Through our platform, users not only enjoy exciting and competitive gaming experiences but can also earn real economic benefits through a transparent and sustainable reward system.",
        "We believe that the future of the digital industry lies in the integration of games, blockchain technology, and a mutually supportive community system."
      ],
      vision: "Vision",
      visionDesc: "To be a pioneer in the digital transformation of entertainment and finance.",
      mission: "Mission",
      missionList: [
        "To provide a fun and engaging gaming platform.",
        "To offer added financial value through secure and trusted digital token technology.",
        "To build a sustainable and future-ready digital economy platform."
      ],
      features: "Key Features",
      p2e: "P2E Tokenomics",
      p2eDesc: "A token-based economy system that rewards players for playing and competing.",
      referral: "Smart Referral",
      referralDesc: "Earn commissions through intelligent referral systems with full transparency on the blockchain.",
      championship: "Championship System",
      championshipDesc: "A structured competition system with circuit rentals and attractive token rewards.",
      multiverse: "Game Multiverse",
      multiverseDesc: "Connecting various games within one platform with secure and seamless token integration.",
      stayConnected: "Stay Connected",
      follow: "Follow us on social media for the latest news and community updates.",
      twitter: "Twitter",
      discord: "Discord",
      telegram: "Telegram"
    }
  };

  const t = labels[lang];

  return (
    <main 
      className="min-vh-100 d-flex flex-column bg-light text-dark position-relative"
      style={{
        backgroundImage: "url('/images/bg-image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar />

      {/* Overlay to make text more readable */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          zIndex: 1,
        }}
      ></div>

      {/* Spacer to avoid being overlapped by the Navbar */}
      <div style={{ height: "80px" }}></div>

      <section className="container my-5" style={{ position: "relative", zIndex: 2 }}>
        <h1 className="text-center display-4 fw-bold mb-4 text-white">{t.title}</h1>

        {/* Introduction Section */}
        <div className="row align-items-center mb-5">
          <div className="col-md-6 text-center">
            <Image
              src="/logo.png"
              alt=" Logo"
              width={400}
              height={300}
              className="img-fluid"
            />
          </div>
          <div className="col-md-6">
            {t.intro.map((txt, i) => (
              <p className="lead text-white mb-3" key={i}>{txt}</p>
            ))}
          </div>
        </div>

        {/* Vision and Mission Section */}
        <div className="card shadow-sm p-4 rounded-4 mb-5 bg-white bg-opacity-75 text-dark">
          <h2 className="fw-bold">{t.vision}</h2>
          <p>{t.visionDesc}</p>

          <h2 className="fw-bold mt-4">{t.mission}</h2>
          <ul>
            {t.missionList.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>

        {/* Key Features Section */}
        <div className="card shadow-sm p-4 rounded-4 mb-5 bg-white bg-opacity-75 text-dark">
          <h2 className="fw-bold">{t.features}</h2>
          <div className="row">
            <div className="col-md-6">
              <h4>{t.p2e}</h4>
              <p>{t.p2eDesc}</p>
              <h4>{t.referral}</h4>
              <p>{t.referralDesc}</p>
            </div>
            <div className="col-md-6">
              <h4>{t.championship}</h4>
              <p>{t.championshipDesc}</p>
              <h4>{t.multiverse}</h4>
              <p>{t.multiverseDesc}</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-5 text-center">
          <h3 className="fw-bold text-white">{t.stayConnected}</h3>
          <p className="text-white">
            {t.follow}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a href="https://twitter.com/" className="btn btn-primary">{t.twitter}</a>
            <a href="https://discord.gg/" className="btn btn-secondary">{t.discord}</a>
            <a href="https://t.me/" className="btn btn-info">{t.telegram}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
