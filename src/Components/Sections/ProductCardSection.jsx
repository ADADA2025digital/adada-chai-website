import React from "react";
import ProductCardItem from "../ProductCardItem";
import productTopIcon from "../../assets/images/smicon.png";
import { productCardData } from "../../Constant/data";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";

const ProductCardSection = () => {
  return (
    <motion.section
      className="productCard-section"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container">
        {/* Top Icon */}
        <div className="row">
          <div className="col-12 text-center">
            <div className="productCard-topIcon">
              <img
                src={productTopIcon}
                alt="Icon"
                className="productCard-topIconImg"
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9 col-12 text-center">
            <h2 className="productCard-title">OUR PRODUCT</h2>
            <p className="productCard-description">
              Lorem Ipsum lhdhyfie Jjsncxqeu jnhxui2q qbechec heb2wuchhwbecu2b
              iheb2ubd huwbdw hwcb iuewd2 ierfv uwecbhuieFIJN JVRBRVV nhfcviurnbv
              jhbcehbc2e necu2h ebd 2udb iu2edb.
            </p>
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className="productCard-swiperWrap">
          <Swiper
            modules={[Navigation, Autoplay]}
            loop={productCardData.length > 5}
            speed={3000}
            spaceBetween={20}
            slidesPerView={1}
            slidesPerGroup={1}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: ".productCard-prev",
              nextEl: ".productCard-next",
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
                slidesPerView: 5,
                spaceBetween: 20,
              },
            }}
            className="productCard-swiper"
          >
            {productCardData.map((item) => (
              <SwiperSlide key={item.id} className="productCard-slide">
                <ProductCardItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>

          {productCardData.length > 1 && (
            <div className="productCard-controls">
              <button
                className="productCard-arrowBtn productCard-prev"
                type="button"
                aria-label="Previous"
              >
                <FaChevronLeft />
              </button>

              <button
                className="productCard-arrowBtn productCard-next"
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

export default ProductCardSection;