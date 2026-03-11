import React from "react";
import smicon from "../../assets/images/smicon.png";
import { trustLogoData } from "../../Constant/data";
import TrustLogoItem from "../TrustLogoItem.jsx";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

const TrustSection = () => {
  const shouldDesktopSlider = trustLogoData.length > 3;

  return (
    <section className="trust-section">
      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <div className="trust-topIcon">
              <img src={smicon} alt="Tea Icon" className="trust-topIconImg" />
            </div>

            <h2 className="trust-title">TRUSTED BY</h2>
          </div>
        </div>

        {/* Desktop static only when 3 or less */}
        {!shouldDesktopSlider ? (
          <div className="row justify-content-center align-items-center trust-logo-row d-none d-lg-flex">
            {trustLogoData.map((logo) => (
              <div className="col-lg-4 text-center" key={logo.id}>
                <TrustLogoItem logo={logo} />
              </div>
            ))}
          </div>
        ) : null}

        {/* Swiper for mobile/tablet always, and desktop when > 3 */}
        <div
          className={`trust-swiper-wrapper ${
            !shouldDesktopSlider ? "d-lg-none" : ""
          }`}
        >
          <Swiper
            modules={[Autoplay, Navigation]}
            loop={trustLogoData.length > 1}
            speed={3000}
            spaceBetween={20}
            slidesPerView={1}
            slidesPerGroup={1}
            autoplay={{
              delay: 2200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".trust-swiper-prev",
              nextEl: ".trust-swiper-next",
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              576: {
                slidesPerView: 1.2,
                spaceBetween: 18,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              992: {
                slidesPerView: shouldDesktopSlider ? 3 : 3,
                spaceBetween: 22,
              },
              1200: {
                slidesPerView: shouldDesktopSlider ? 3 : 3,
                spaceBetween: 24,
              },
            }}
            className="trust-swiper"
          >
            {trustLogoData.map((logo) => (
              <SwiperSlide key={logo.id} className="trust-slide">
                <TrustLogoItem logo={logo} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* {trustLogoData.length > 1 && (
            <div className="trust-swiper-arrows">
              <button className="trust-swiper-prev" aria-label="Previous">
                 <FaChevronLeft />
              </button>
              <button className="trust-swiper-next" aria-label="Next">
                  <FaChevronRight />
              </button>
            </div>
          )} */}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;