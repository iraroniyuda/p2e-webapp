"use client";
import Navbar from "@/components/layout/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";

export default function Contact() {
  const [lang, setLang] = useState("id");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLang(localStorage.getItem("lang") || "id");
    }
  }, []);

  const labels = {
    id: {
      title: "Kontak Kami",
      intro: "Ada pertanyaan, masukan, atau butuh bantuan? Hubungi tim kami!",
      email: "Email",
      phone: "Telepon",
      follow: "Ikuti Kami",
      sendMessage: "Kirim Pesan ke Kami",
      name: "Nama",
      emailLabel: "Email",
      message: "Pesan",
      sendBtn: "Kirim Pesan",
      placeholderName: "Nama Lengkap Anda",
      placeholderEmail: "Alamat Email Anda",
      placeholderMessage: "Pesan Anda",
      success: "Pesan berhasil dikirim.",
      twitter: "Twitter",
      discord: "Discord",
      telegram: "Telegram",
    },
    en: {
      title: "Contact Us",
      intro: "Have any questions, feedback, or need help? Get in touch with us!",
      email: "Email",
      phone: "Phone",
      follow: "Follow Us",
      sendMessage: "Send Us a Message",
      name: "Name",
      emailLabel: "Email",
      message: "Message",
      sendBtn: "Send Message",
      placeholderName: "Your Full Name",
      placeholderEmail: "Your Email Address",
      placeholderMessage: "Your Message",
      success: "Message sent successfully.",
      twitter: "Twitter",
      discord: "Discord",
      telegram: "Telegram",
    },
  };

  const t = labels[lang];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate sending message (replace with API call)
    setTimeout(() => {
      setStatus(t.success);
      setName("");
      setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <main 
      className="min-vh-100 d-flex flex-column position-relative"
      style={{
        backgroundImage: "url('/images/bg-image.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar />

      {/* Overlay untuk membuat teks lebih terbaca */}
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

      {/* Spacer untuk menghindari tertimpa Navbar */}
      <div style={{ height: "80px", position: "relative", zIndex: 2 }}></div>

      <section className="container my-5" style={{ position: "relative", zIndex: 2 }}>
        <h1 className="text-center display-4 fw-bold mb-4 text-white">{t.title}</h1>

        {/* Section Introduction */}
        <p className="lead text-center text-white mb-5">
          {t.intro}
        </p>

        {/* Contact Information */}
        <div className="row mb-5 text-white">
          <div className="col-md-6 text-center">
            <h4>{t.email}</h4>
            <p></p>

            <h4>{t.phone}</h4>
            <p></p>
          </div>
          <div className="col-md-6 text-center">
            <h4>{t.follow}</h4>
            <div className="d-flex justify-content-center gap-3 mt-2">
              <a href="https://twitter.com/" target="_blank" className="btn btn-primary">{t.twitter}</a>
              <a href="https://discord.gg/" target="_blank" className="btn btn-secondary">{t.discord}</a>
              <a href="https://t.me/" target="_blank" className="btn btn-info">{t.telegram}</a>
            </div>
          </div>
        </div>

        {/* Contact Form 
        <div className="card p-4 shadow-sm rounded-4 bg-white bg-opacity-75 text-dark">
          <h3 className="fw-bold mb-4">{t.sendMessage}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">{t.name}</label>
              <input 
                type="text" 
                className="form-control bg-white text-dark border-0" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder={t.placeholderName}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">{t.emailLabel}</label>
              <input 
                type="email" 
                className="form-control bg-white text-dark border-0" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder={t.placeholderEmail}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">{t.message}</label>
              <textarea 
                className="form-control bg-white text-dark border-0" 
                rows="5" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                required 
                placeholder={t.placeholderMessage}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary w-100">{t.sendBtn}</button>
          </form>

          {status && (
            <div className="alert alert-success mt-3 text-center">
              {status}
            </div>
          )}
        </div> */}
      </section>
    </main>
  );
}
