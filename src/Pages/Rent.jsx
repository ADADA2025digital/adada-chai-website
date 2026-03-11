import React, { useState } from "react";
import Banner from "../Components/Banner";
import RentEnquiryForm from "../Components/RentEnquiryForm";
import bannerBg from "../assets/images/about-banner.png";
import smicon from "../assets/images/smicon.png";
import { rentProductData } from "../Constant/data";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const Rent = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeProduct = rentProductData[activeIndex];

  return (
    <div className="container-fluid p-0">
      <Banner
        title="RENT"
        subtitle="A cup of peace in every pour."
        breadcrumb="HOME > RENT"
        bgImage={bannerBg}
      />

      <section className="rent-page-section py-4 py-lg-5">
        <div className="container">
          <motion.div
            className="text-center mb-3 mb-lg-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img src={smicon} alt="icon" className="img-fluid" />
          </motion.div>

          <div className="row align-items-center gy-4 gy-lg-0">
            {/* Left Side */}
            <div className="col-lg-5 col-12">
              <motion.div
                className="rent-slider-wrap text-center mx-4 mx-md-0"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.85, ease: "easeOut" }}
              >
                <Swiper
                  modules={[Navigation, Autoplay]}
                  loop={rentProductData.length > 1}
                  speed={900}
                  slidesPerView={1}
                  spaceBetween={0}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  navigation={{
                    prevEl: ".rent-prev",
                    nextEl: ".rent-next",
                  }}
                  onSlideChange={(swiper) => {
                    const realIndex =
                      typeof swiper.realIndex === "number"
                        ? swiper.realIndex
                        : swiper.activeIndex;
                    setActiveIndex(realIndex);
                  }}
                  className="rent-swiper"
                >
                  {rentProductData.map((product) => (
                    <SwiperSlide key={product.id}>
                      <div className="rent-product-image-wrap d-flex justify-content-center align-items-center">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="img-fluid rent-product-image"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {rentProductData.length > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <button
                      type="button"
                      className="rent-nav-btn rent-prev"
                      aria-label="Previous"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      type="button"
                      className="rent-nav-btn rent-next"
                      aria-label="Next"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Side */}
            <div className="col-lg-7 col-12">
              <motion.div
                className="rent-product-details mx-4 mx-md-0"
                key={activeProduct.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.12, ease: "easeOut" }}
              >
                <h2 className="rent-product-title mb-2">
                  {activeProduct.title}
                </h2>

                <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
                  <div className="rent-stars d-flex align-items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <FaStar key={index} />
                    ))}
                  </div>
                  <span className="rent-rating-text">4.0</span>
                  <span className="rent-review-text">5 review</span>
                </div>

                <div className="rent-price mb-3">
                  ${activeProduct.price.toFixed(2)}
                </div>

                <p className="rent-description mb-3">
                  {activeProduct.description}
                </p>

                <div className="rent-meta-list">
                  <p className="mb-2">
                    <strong>Availability :</strong> {activeProduct.availability}
                  </p>
                  <p className="mb-2">
                    <strong>Category :</strong> {activeProduct.category}
                  </p>
                  <p className="mb-2">
                    <strong>Category Description :</strong>{" "}
                    {activeProduct.categoryDescription}
                  </p>
                  <p className="mb-0">
                    <strong>Specification :</strong>{" "}
                    {activeProduct.specification}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="row justify-content-center mt-4 mt-lg-5">
            <div className="col-lg-9 col-12">
              <motion.div
                className="mx-4 mx-md-0"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.9, delay: 0.18, ease: "easeOut" }}
              >
                <RentEnquiryForm productTitle={activeProduct.title} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rent;