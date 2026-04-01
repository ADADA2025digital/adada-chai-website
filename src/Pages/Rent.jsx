import React, { useState, useEffect } from "react";
import Banner from "../Components/Banner";
import RentEnquiryForm from "../Components/RentEnquiryForm";
import bannerBg from "../assets/images/about-banner.png";
import smicon from "../assets/images/smicon.png";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { productAPI } from "../Config/route";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

// Helper function to sanitize HTML (basic version without DOMPurify)
const sanitizeHTML = (html) => {
  if (!html) return "";
  // Remove script tags and dangerous event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
};

const Rent = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rentProductData, setRentProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await productAPI.getAllProducts();
        
        // Filter products with category "Vending Machine"
        const vendingMachineProducts = products
          .filter(product => {
            if (product.category && product.category.category_name) {
              return product.category.category_name.toLowerCase() === "vending machine";
            }
            return false;
          })
          .map((product) => {
            let imageUrl = "/default-image.jpg";
            if (product.assets && Array.isArray(product.assets)) {
              const imageAsset = product.assets.find(asset => asset.asset_type === "image");
              if (imageAsset && imageAsset.asset_url) {
                imageUrl = imageAsset.asset_url;
              } else if (product.assets[0] && product.assets[0].asset_url) {
                imageUrl = product.assets[0].asset_url;
              }
            }
            
            return {
              id: product.product_id || product.id,
              title: product.product_name || product.title || "Product Title",
              image: imageUrl,
              price: parseFloat(product.sell_price) || 0,
              description: product.description || "No description available",
              rating: product.rating || "4.0",
              reviews: product.review_count || "5",
              availability: product.product_status === "Active" ? "In Stock" : "Available on Request",
              category: product.category?.category_name || "Vending Machine",
              categoryDescription: product.category?.category_description || "",
              specification: product.specification || "Standard specifications"
            };
          });
        
        setRentProductData(vendingMachineProducts);
        
        if (vendingMachineProducts.length === 0) {
          setError("No vending machine products available at the moment.");
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <Banner
          title="RENT"
          subtitle="A cup of peace in every pour."
          breadcrumb="HOME > RENT"
          bgImage={bannerBg}
        />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-0">
        <Banner
          title="RENT"
          subtitle="A cup of peace in every pour."
          breadcrumb="HOME > RENT"
          bgImage={bannerBg}
        />
        <div className="text-center py-5">
          <p className="text-danger">{error}</p>
        </div>
      </div>
    );
  }

  if (rentProductData.length === 0) {
    return (
      <div className="container-fluid p-0">
        <Banner
          title="RENT"
          subtitle="A cup of peace in every pour."
          breadcrumb="HOME > RENT"
          bgImage={bannerBg}
        />
        <div className="text-center py-5">
          <p>No vending machine products available at the moment.</p>
        </div>
      </div>
    );
  }

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
                          style={{ maxHeight: "400px", objectFit: "contain" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-image.jpg";
                          }}
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
                  <span className="rent-rating-text">{activeProduct.rating}</span>
                  <span className="rent-review-text">{activeProduct.reviews} review{activeProduct.reviews !== 1 ? 's' : ''}</span>
                </div>

                <div className="rent-price mb-3">
                  ${typeof activeProduct.price === 'number' ? activeProduct.price.toFixed(2) : activeProduct.price}
                </div>

                {/* Render description with HTML and CKEditor alignment */}
                <div 
                  className="rent-description mb-3 ck-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(activeProduct.description) }}
                />

                <div className="rent-meta-list">
                  <p className="mb-2">
                    <strong>Availability :</strong> {activeProduct.availability}
                  </p>
                  <p className="mb-2">
                    <strong>Category :</strong> {activeProduct.category}
                  </p>
                  {activeProduct.categoryDescription && (
                    <p className="mb-2">
                      <strong>Category Description :</strong> {activeProduct.categoryDescription}
                    </p>
                  )}
                  <p className="mb-0">
                    <strong>Specification :</strong>
                  </p>
                  {/* Render specification with HTML and CKEditor alignment */}
                  <div 
                    className="rent-specification-content ck-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(activeProduct.specification) }}
                  />
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
                <RentEnquiryForm 
                  productTitle={activeProduct.title} 
                  productId={activeProduct.id}
                  productsList={rentProductData}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rent;