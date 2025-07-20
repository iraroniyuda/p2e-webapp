/* "use client";
import apiClient from "@/services/apiClient"; // pastikan import
import { useEffect, useState } from "react";

const RunningMediaImage = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await apiClient.get("/cms/running-media");
        const shuffled = res.data.sort(() => Math.random() - 0.5);
        setImages(shuffled);
      } catch (err) {
        console.error("❌ Gagal ambil gambar running media:", err);
      }
    };
    fetchImages();
  }, []);

  return (
    <div style={containerStyle}>
      <div className="marquee">
        <div className="marquee__inner">
          {images.concat(images).map((image, index) => (
            <img 
              key={index}
              src={`/images/running-media/${image}`} 
              alt={`Media ${index + 1}`} 
              style={imageStyle}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee {
          overflow: hidden;
          position: relative;
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
        }

        .marquee__inner {
          display: flex;
          gap: 1rem;
          width: max-content;
          animation: scrollLeft 20s linear infinite;
        }

        .marquee__inner img {
          height: 300px;
          width: auto;
          flex-shrink: 0;
          object-fit: cover;
        }

        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 2)); }
        }
      `}</style>
    </div>
  );
};

const containerStyle = {
  width: "100%",
  overflow: "hidden",
  padding: "1rem 0",
  margin: "1rem 0",
  position: "relative",
};

const imageStyle = {
  height: "300px",
  width: "auto",
  objectFit: "cover",
  display: "inline-block",
};

export default RunningMediaImage;

*/
"use client";
import { useEffect, useState } from "react";

// Daftar gambar (6 square + 6 rectangle)
const imageNames = [
  "square1.jpg", "square2.jpg", "square3.jpg", "square4.jpg", "square5.jpg", "square6.jpg",
  "rect1.jpg", "rect2.jpg", "rect3.jpg", "rect4.jpg", "rect5.jpg", "rect6.jpg"
];

// Fungsi untuk mengacak urutan gambar
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

const RunningMediaImage = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Acak urutan gambar saat komponen dimuat
    setImages(shuffleArray(imageNames));
  }, []);

  return (
    <div style={containerStyle}>
      <div className="marquee">
        <div className="marquee__inner">
          {images.map((image, index) => (
            <img 
              key={index} 
              src={`/images/${image}`} 
              alt={`Image ${index + 1}`} 
              style={imageStyle} 
            />
          ))}
          {images.map((image, index) => (
            <img 
              key={`duplicate-${index}`} 
              src={`/images/running-media/${image}`} 
              alt={`Image Duplicate ${index + 1}`} 
              style={imageStyle} 
            />
          ))}
        </div>
      </div>

      {/* CSS Pure untuk Marquee */}
      <style jsx>{`
        .marquee {
          overflow: hidden;
          position: relative;
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
        }

        .marquee__inner {
          display: flex;
          gap: 1rem;
          width: max-content;
          animation: scrollLeft 20s linear infinite;
        }

        .marquee__inner img {
          height: 300px;
          width: auto;
          flex-shrink: 0;
          object-fit: cover;
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 2));
          }
        }
      `}</style>
    </div>
  );
};

// Gaya kontainer utama
const containerStyle = {
  width: "100%",
  overflow: "hidden",
  padding: "1rem 0",
  margin: "1rem 0",
  position: "relative",
};

// Gaya untuk gambar
const imageStyle = {
  height: "300px", // Tinggi gambar seragam
  width: "auto",   // Lebar otomatis sesuai proporsi
  objectFit: "cover",
  display: "inline-block",
};

export default RunningMediaImage;

