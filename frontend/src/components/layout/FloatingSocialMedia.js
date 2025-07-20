// src/components/layout/FloatingSocialMedia.js
"use client";
import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaTelegram, FaTwitter, FaYoutube } from "react-icons/fa";

const FloatingSocialMedia = () => {
  const [currentY, setCurrentY] = useState(0);
  const [targetY, setTargetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setTargetY(window.scrollY + window.innerHeight / 3);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const animateScroll = () => {
      setCurrentY((prevY) => prevY + (targetY - prevY) * 0.1); // Smooth transition
      requestAnimationFrame(animateScroll);
    };

    animateScroll();
  }, [targetY]);

  return (
    <div
      style={{
        position: "absolute",
        right: "1rem",
        top: `${currentY}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0.5rem",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)", // Efek blur transparan
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        transition: "top 0.2s ease-in-out",
        zIndex: 9999,
      }}
    >
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
        <FaFacebook />
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
        <FaTwitter />
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
        <FaInstagram />
      </a>
      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={iconStyle}>
        <FaYoutube />
      </a>
      <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" style={iconStyle}>
        <FaTelegram />
      </a>
    </div>
  );
};

// Style untuk icon
const iconStyle = {
  fontSize: "1.5rem",
  color: "#ffffff",
  margin: "0.3rem 0",
  padding: "0.5rem",
  background: "rgba(0, 0, 0, 0.6)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.3s ease",
};

// Hover effect untuk icon
const hoverStyle = {
  background: "rgba(0, 0, 0, 0.8)",
};

export default FloatingSocialMedia;
