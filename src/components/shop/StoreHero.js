import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Slider from "react-slick";

const StoreHero = ({
  images,
  title,
  description,
  icon = null,
  height = "500px",
  eyebrow = "Plantopia store",
}) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <section className="store-hero position-relative" style={{ minHeight: height }}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <div className="store-hero__slide" style={{ height }}>
              <img
                src={image}
                alt={`Imagen ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </Slider>

      <div className="store-hero__content">
        <span className="store-hero__eyebrow">{eyebrow}</span>
        <h1 className="store-hero__title">
          {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
          {title}
        </h1>
        <p>{description}</p>
      </div>
    </section>
  );
};

export default StoreHero;
