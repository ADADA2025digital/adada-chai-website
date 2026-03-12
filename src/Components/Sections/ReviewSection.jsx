import React from "react";
import smicon from "../../assets/images/smicon.png";
import { reviewData } from "../../Constant/data";
import ReviewCardItem from "../ReviewCardItem.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";

const ReviewSection = () => {
  return (
    <motion.section
      className="review-section"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container">
        {/* Top Icon & Title */}
        <div className="row">
          <div className="col-12 text-center">
            <div className="review-topIcon">
              <img
                src={smicon}
                alt="Tea Icon"
                
              />
            </div>
            <h2 className="review-title">CUSTOMER REVIEWS</h2>
          </div>
        </div>

        <div className="review-swiperWrap">
          <Swiper
            modules={[Navigation, Autoplay]}
            loop={reviewData.length > 4}
            speed={2000}
            spaceBetween={24}
            slidesPerView={1}
            slidesPerGroup={1}
            autoplay={{
              delay: 1000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".review-prev",
              nextEl: ".review-next",
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1200: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            className="review-swiper"
          >
            {reviewData.map((item) => (
              <SwiperSlide key={item.id} className="review-slide">
                <ReviewCardItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>

          {reviewData.length > 1 && (
            <div className="review-controls">
              <button
                className="review-arrowBtn review-prev"
                type="button"
                aria-label="Previous"
              >
                <FaChevronLeft />
              </button>
              <button
                className="review-arrowBtn review-next"
                type="button"
                aria-label="Next"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default ReviewSection;