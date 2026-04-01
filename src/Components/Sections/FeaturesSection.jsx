import React, { useState, useEffect } from "react";
import smicon from "../../assets/images/smicon.png";
import { featuresData } from "../../Constant/data";
import FeatureCard from "../FeatureCard.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { productAPI } from "../../Config/route.js";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const FeaturesSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await productAPI.getAllProducts();
        
        // Handle different response structures
        let productsArray = productsData;
        
        if (productsData && productsData.data && Array.isArray(productsData.data)) {
          productsArray = productsData.data;
        } else if (productsData && productsData.products && Array.isArray(productsData.products)) {
          productsArray = productsData.products;
        } else if (!Array.isArray(productsData)) {
          productsArray = [];
        }

        if (productsArray.length === 0) {
          setProducts(featuresData);
          setError(null);
          setLoading(false);
          return;
        }

        const transformedProducts = productsArray.map((product, index) => {
          const productTitle = product.title || 
                              product.name || 
                              product.product_name || 
                              product.productTitle || 
                              product.ProductName ||
                              product.productName ||
                              product.heading ||
                              `Product ${index + 1}`;
          
          const productDescription = product.description || 
                                    product.product_description || 
                                    product.desc || 
                                    product.productDesc ||
                                    product.short_description ||
                                    "Product description goes here";
          
          const productIcon = product.icon || 
                             product.image || 
                             product.product_image ||
                             smicon;

          return {
            id: product.id || product._id || index,
            icon: productIcon,
            title: productTitle,
            description: productDescription,
          };
        });

        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
        setProducts(featuresData);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const displayData = products.length > 0 ? products : featuresData;

  return (
    <section className="features-section">
      <div className="container">
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

        <motion.div
          className="feature-swiper-wrap"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        >
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-5 text-danger">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <Swiper
                modules={[Navigation, Autoplay]}
                loop={displayData.length > 4}
                speed={2000}
                slidesPerView={1}
                slidesPerGroup={1}
                spaceBetween={24}
                autoplay={{
                  delay: 1000,
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
                {displayData.map((item, index) => (
                  <SwiperSlide key={item.id || index} className="feature-slide">
                    <motion.div
                      className="feature-motion-wrap"
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

              {displayData.length > 1 && (
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
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;