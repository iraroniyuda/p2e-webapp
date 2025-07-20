"use client";
import AnnouncementItem from "./AnnouncementItem";

export default function AnnouncementSection() {
  // Data pengumuman hardcoded (contoh)
  const announcements = [
    {
      title: "Event Balapan Akhir Tahun",
      date: "2025-12-25",
      content: "Ikuti event balapan akhir tahun dan menangkan hadiah menarik!",
    },
    {
      title: "Maintenance Server",
      date: "2025-11-01",
      content: "Server akan mengalami maintenance pada 1 November 2025 dari pukul 00:00 - 04:00 WIB.",
    },
    {
      title: "Airdrop TBP Khusus Pengguna Aktif",
      date: "2025-10-15",
      content: "Dapatkan airdrop TBP gratis bagi pengguna yang aktif bermain.",
    },
    {
      title: "Update Sistem Referral",
      date: "2025-09-20",
      content: "Sistem referral telah diperbarui untuk memberikan bonus lebih besar.",
    }
  ];

  return (
    <div 
      className="container p-4 rounded" 
      style={{
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "15px",
        boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h3 className="mb-5 text-black">Pengumuman</h3>
      <div className="d-flex flex-column gap-3">
        {announcements.map((announcement, index) => (
          <AnnouncementItem 
            key={index}
            title={announcement.title}
            date={announcement.date}
            content={announcement.content}
            titleColor="#FFD700"        
            dateColor="#AAAAAA"         
            contentColor="#FFFFFF"      
          />
        ))}
      </div>
    </div>
  );
}
