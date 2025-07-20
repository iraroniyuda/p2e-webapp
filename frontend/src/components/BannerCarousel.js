/*
// src/components/BannerCarousel.js
import { Carousel } from "react-bootstrap";

const BannerCarousel = ({ banners = [] }) => {
  return (
    <section style={{ width: "100%", overflow: "hidden", position: "relative" }}>
      <Carousel>
        {banners.map((item, idx) => (
          <Carousel.Item key={idx}>
            <img
              className="d-block w-100 rounded"
              src={item.mediaUrl}
              alt={item.title || `Banner ${idx + 1}`}
              style={{ height: "auto", objectFit: "cover" }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
};

export default BannerCarousel;
*/

// src/components/BannerCarousel.js
import { Carousel } from "react-bootstrap";

const BannerCarousel = () => {
  return (
    <section style={{ width: "100%", overflow: "hidden", position: "relative" }}>
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src="/images/banner-ugc-1.png"
            alt=""
            style={{ height: "auto", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src="/images/banner-ugc-2.png"
            alt=""
            style={{ height: "auto", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src="/images/banner-ugc-3.png"
            alt="Championship Event"
            style={{ height: "auto", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src="/images/banner-ugc-4.png"
            alt="Championship Event"
            style={{ height: "auto", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src="/images/banner-ugc-5.png"
            alt="Championship Event"
            style={{ height: "auto", objectFit: "cover" }}
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100 rounded"
            src="/images/banner-ugc-6.png"
            alt="Championship Event"
            style={{ height: "auto", objectFit: "cover" }}
          />
        </Carousel.Item>
      </Carousel>
    </section>
  );
};

export default BannerCarousel;
