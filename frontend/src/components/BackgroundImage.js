// src/components/BackgroundImage.js
import "@/styles/animation.css";

const BackgroundImage = () => {
  return (
    <div
      style={{
        position: "relative",
        height: "auto", // Tinggi image
        marginTop: "-20vh", // Beririsan dengan video
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <img
        src="/images/bg-home.png"
        alt="Background"
        style={{
          width: "100%",
          height: "auto", // Auto mengikuti aspect ratio
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default BackgroundImage;
