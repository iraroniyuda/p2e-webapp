

import Image from "next/image";

const AboutSection = ({ titleColor = "text-dark", textColor = "text-muted" }) => {
  // Ambil dari localStorage
  let lang = "id";
  if (typeof window !== "undefined") {
    lang = localStorage.getItem("lang") || "id";
  }

  const texts = {
    id: [
      "adalah perusahaan inovatif di bidang gaming dan tokenomics berbasis web dan mobile, berfokus pada pengembangan ekosistem digital yang mengintegrasikan hiburan interaktif dan peluang ekonomi berbasis blockchain.",
      "Melalui platform kami, pengguna tidak hanya menikmati pengalaman gaming yang seru dan kompetitif, tetapi juga bisa memperoleh manfaat ekonomi nyata melalui sistem reward yang transparan dan berkelanjutan.",
      "Kami percaya masa depan industri digital terletak pada integrasi antara gaming, teknologi blockchain, dan sistem komunitas yang saling mendukung. Dengan tokenomics yang kuat dan sistem multi-level yang adil, kami menciptakan peluang bagi pemain, developer, dan mitra bisnis untuk tumbuh bersama dalam ekosistem yang saling menguntungkan."
    ],
    en: [
      "is an innovative company engaged in the field of gaming and tokenomics based on web and mobile systems, with a primary focus on developing a digital ecosystem that integrates interactive entertainment and blockchain-based economic opportunities.",
      "Through our platform, users not only enjoy exciting and competitive gaming experiences but can also gain real economic benefits through a transparent and sustainable reward system.",
      "We believe that the future of the digital industry lies in the integration of gaming, blockchain technology, and a mutually supportive community system. By leveraging strong tokenomics and a fair multi-level system, we create opportunities for players, developers, and business partners to grow together within a mutually beneficial ecosystem."
    ]
  };

  return (
    <section className="container my-5 position-relative content">
      <div className="row align-items-center mb-3">

        <div className="col-md-4 d-flex justify-content-start align-items-start pe-0" style={{ paddingLeft: 0 }}>
          <Image 
            src="/tbplogo.png" 
            alt="TBP Company" 
            width={300} 
            height={300} 
            className="img-fluid" 
            style={{ marginLeft: "-10px", objectFit: "contain" }} 
          />
        </div>

        <div className="col-md-8" style={{ paddingLeft: "0.5rem" }}> 
          <h2 className={`display-6 fw-bold mb-2 ${titleColor}`} style={{ marginBottom: "0.5rem" }}>
            
          </h2>
          {texts[lang].map((par, idx) => (
            <p key={idx} className={`${textColor} mb-2`}>{par}</p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
