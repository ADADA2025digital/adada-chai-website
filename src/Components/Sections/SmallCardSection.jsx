import React from "react";
import { smallCardData } from "../../Constant/data";
import SmallCardItem from "../../Components/SmallCardItem";
import smicon from "../../assets/images/smicon.png";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/pagination";

const SmallCardSection = () => {
  return (
    <motion.section
      className="smallCard-section"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <div className="smallCard-top-icon">
              <img src={smicon} alt="Tea Icon" className="smallCard-top-image" />
            </div>
          </div>
        </div>

        <div className="smallCard-swiper-wrap">
          <Swiper
            modules={[Autoplay, Pagination]}
            loop={smallCardData.length > 4}
            speed={3000}
            spaceBetween={24}
            slidesPerView={1}
            slidesPerGroup={1}
            autoplay={{
              delay: 2200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              el: ".smallCard-swiper-pagination",
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
                slidesPerView: 3,
                spaceBetween: 22,
              },
              1200: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            className="smallCard-swiper"
          >
            {smallCardData.map((card) => (
              <SwiperSlide key={card.id} className="smallCard-slide">
                <SmallCardItem card={card} />
              </SwiperSlide>
            ))}
          </Swiper>

          {smallCardData.length > 1 && (
            <div className="smallCard-swiper-pagination smallCard-indicators mt-4" />
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default SmallCardSection;