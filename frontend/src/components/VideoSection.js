const VideoSection = () => {
  return (
    <section className="container my-5 position-relative content">
      <h2 className="mb-4 text-center"></h2>
      {/* Video utama 16:9 */}
      <div className="ratio ratio-16x9 shadow-sm rounded overflow-hidden mb-4">
        <iframe
          src=""
          title=""
          allowFullScreen
          className="w-100"
        />
      </div>
      {/* Shorts 1 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          aspectRatio: "9 / 16",
          margin: "0 auto",
          background: "#111",
          borderRadius: 12,
          overflow: "hidden",
        }}
        className="shadow-sm mb-3"
      >
        <iframe
          src=""
          title=""
          allowFullScreen
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            border: 0,
            background: "#111"
          }}
        />
      </div>
      {/* Shorts 2 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          aspectRatio: "9 / 16",
          margin: "0 auto",
          background: "#111",
          borderRadius: 12,
          overflow: "hidden",
        }}
        className="shadow-sm mb-3"
      >
        <iframe
          src=""
          title=""
          allowFullScreen
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            border: 0,
            background: "#111"
          }}
        />
      </div>
            {/* Shorts 3 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          aspectRatio: "9 / 16",
          margin: "0 auto",
          background: "#111",
          borderRadius: 12,
          overflow: "hidden",
        }}
        className="shadow-sm mb-3"
      >
        <iframe
          src=""
          title=""
          allowFullScreen
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            border: 0,
            background: "#111"
          }}
        />
      </div>
    </section>
  );
};

export default VideoSection;
