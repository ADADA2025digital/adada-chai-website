import React from "react";
import smicon from "../../assets/images/smicon.png";
import { featuresData } from "../../Constant/data";
import FeatureCard from "../FeatureCard.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const FeaturesSection = () => {
  return (
    <section className="features-section">
      <div className="container">
        {/* Header */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="feature-top-icon">
            <img src={smicon} alt="icon" className="feature-top-icon-img" />
          </div>

          <h6 className="feature-subtitle">OUR FEATURES</h6>
          <h2 className="feature-title">What We Provide You</h2>

          <p className="feature-description">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s.
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          className="feature-swiper-wrap"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        >
          <Swiper
            modules={[Navigation, Autoplay]}
            loop={featuresData.length > 4}
            speed={3000}
            slidesPerView={1}
            slidesPerGroup={1}
            spaceBetween={24}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".feature-prev",
              nextEl: ".feature-next",
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
            className="feature-swiper"
          >
            {featuresData.map((item, index) => (
              <SwiperSlide key={item.id} className="feature-slide">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <FeatureCard data={item} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {featuresData.length > 1 && (
            <div className="feature-controls">
              <button
                className="feature-arrow-btn feature-prev"
                type="button"
                aria-label="Previous"
              >
                <FaChevronLeft />
              </button>

              <button
                className="feature-arrow-btn feature-next"
                type="button"
                aria-label="Next"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;