// apps/frontend/src/app/Home.js

"use client";
import AboutSection from "@/components/AboutSection";
import BackgroundImage from "@/components/BackgroundImage";
import BannerCarousel from "@/components/BannerCarousel";
import GameListSection from "@/components/GameListSection";
import FloatingSocialMedia from "@/components/layout/FloatingSocialMedia";
import Footer from "@/components/layout/Footer";
import AppNavbar from "@/components/layout/Navbar";
import RunningMediaImage from "@/components/RunningMediaImage";
import VideoBackground from "@/components/VideoBackground";
import VideoSection from "@/components/VideoSection";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [loadingGame, setLoadingGame] = useState(null);

  return (
    <main className="min-vh-100 d-flex flex-column text-dark position-relative">
      <AppNavbar />

      {/* Wrapper untuk Video dan Image */}
      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <VideoBackground />
        <BackgroundImage />
      </div>

      {/* Overlay Konten dengan Background Transparan dan Rounded */}
      <div
        className="relative mt-0 pt-5 text-dark"
        style={{
          position: "absolute",
          top: "100vh",
          left: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          padding: "2rem 0",
        }}
      >
        {/* About Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
            padding: "1rem",
            width: "90%",
            maxWidth: "1200px",
            borderRadius: "16px",
          }}
        >
          <AboutSection
            titleColor={styles.textAboutTitle}
            textColor={styles.textAboutDesc}
          />
        </div>

        {/* Game List Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(10px)",
            padding: "0.5rem",
            width: "90%",
            maxWidth: "1200px",
            borderRadius: "16px",
          }}
        >
          <GameListSection />
        </div>

        {/* Banner Carousel */}
        <div
          style={{
            width: "95%",
            maxWidth: "1600px",
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <BannerCarousel />
        </div>

        {/* Tambahan Image Baru: SQUARE & RESPONSIVE */}
        <div className="claim-images-square">
          <div className="claim-img-square-wrap">
            <img src="/images/claimprize.png" alt="Gambar 1" className="claim-img-square" />
          </div>
          <div className="claim-img-square-wrap">
            <img src="/images/claimprize2.png" alt="Gambar 2" className="claim-img-square" />
          </div>
        </div>

        {/* Running Media Image */}
        <div
          style={{
            width: "100%",
            maxWidth: "1600px",
            padding: "1rem",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "6px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <RunningMediaImage />
        </div>

        {/* ROADMAP Title */}
        <h2
          className="text-center fw-bold"
          style={{ fontSize: "2rem", marginTop: "1rem" }}
        >
          ROADMAP
        </h2>

        {/* Gambar 1 */}
        <div
          style={{
            width: "90%",
            maxWidth: "1200px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src="/images/1roadmap.jpeg"
            alt="Gambar 1"
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        {/* Gambar 2 */}
        <div
          style={{
            width: "90%",
            maxWidth: "1200px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src="/images/2roadmap.jpeg"
            alt="Gambar 2"
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        {/* Video Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(10px)",
            padding: "1rem",
            width: "90%",
            maxWidth: "1200px",
            borderRadius: "16px",
          }}
        >
          <VideoSection />
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Floating Social Media */}
      <FloatingSocialMedia />

      {/* Style SQUARE Responsive */}
      <style jsx>{`
        .claim-images-square {
          width: 100%;
          max-width: 1600px;
          margin: 1rem auto;
          display: flex;
          flex-direction: row;
          gap: 1.5rem;
          justify-content: center;
          align-items: stretch;
        }
        .claim-img-square-wrap {
          aspect-ratio: 1/1;
          width: 100%;
          max-width: 720px;
          background: #f8f8f8;
          border-radius: 18px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          border: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .claim-img-square {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 14px;
          display: block;
        }
        @media (max-width: 900px) {
          .claim-images-square {
            max-width: 98%;
            gap: 0.8rem;
          }
          .claim-img-square-wrap {
            max-width: 160px;
            border-radius: 14px;
          }
        }
        @media (max-width: 768px) {
          .claim-images-square {
            flex-direction: column;
            max-width: 360px;
            gap: 0.75rem;
          }
          .claim-img-square-wrap {
            max-width: 100%;
            aspect-ratio: 1/1;
            border-radius: 12px;
          }
          .claim-img-square {
            border-radius: 10px;
          }
        }
      `}</style>
    </main>
  );
}
