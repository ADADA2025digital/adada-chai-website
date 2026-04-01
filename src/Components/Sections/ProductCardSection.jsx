import React, { useState, useEffect } from "react";
import ProductCardItem from "../ProductCardItem";
import productTopIcon from "../../assets/images/smicon.png";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { productAPI } from "../../Config/route";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";

const ProductCardSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAllProducts();
      // console.log("Fetched products data:", data);

      // Ensure data is an array
      let productsArray = [];

      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && typeof data === "object") {
        if (Array.isArray(data.data)) {
          productsArray = data.data;
        } else if (Array.isArray(data.products)) {
          productsArray = data.products;
        } else {
          const values = Object.values(data);
          if (values.length > 0 && Array.isArray(values[0])) {
            productsArray = values[0];
          }
        }
      }

      // Transform the data to match ProductCardItem expectations
      const transformedProducts = productsArray.map((product) => {
        // Extract image URL from assets array
        let imageUrl = null;

        if (
          product.assets &&
          Array.isArray(product.assets) &&
          product.assets.length > 0
        ) {
          // Find the first image asset
          const imageAsset = product.assets.find(
            (asset) => asset.asset_url && asset.asset_type === "image",
          );

          if (imageAsset && imageAsset.asset_url) {
            imageUrl = imageAsset.asset_url;
          } else if (product.assets[0] && product.assets[0].asset_url) {
            // If no specific image type found, use the first asset URL
            imageUrl = product.assets[0].asset_url;
          }
        }

        // If still no image, use a placeholder
        if (!imageUrl) {
          imageUrl = `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.product_name || "Product")}`;
        }

        return {
          id: product.product_id || product.id,
          title: product.product_name || product.name || "Untitled Product",
          image: imageUrl,
          sku: product.sku,
          sell_price: product.sell_price,
          quantity: product.quantity,
          specification: product.specification,
          seo: product.seo,
          description: product.description,
          discount: product.discount,
          category: product.category,
          // Keep original data if needed
          ...product,
        };
      });

      // console.log("Transformed products:", transformedProducts);
      setProducts(transformedProducts);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <motion.section
        className="productCard-section"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </motion.section>
    );
  }

  // Show error state
  if (error) {
    return (
      <motion.section
        className="productCard-section"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container text-center py-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </motion.section>
    );
  }

  // Show no data message
  if (!products || products.length === 0) {
    return (
      <motion.section
        className="productCard-section"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container text-center py-5">
          <p>No products available.</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="productCard-section"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container">
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

        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-9 col-12 text-center">
            <h2 className="productCard-title">OUR PRODUCT</h2>
            <p className="productCard-description">
              Lorem Ipsum lhdhyfie Jjsncxqeu jnhxui2q qbechec heb2wuchhwbecu2b
              iheb2ubd huwbdw hwcb iuewd2 ierfv uwecbhuieFIJN JVRBRVV
              nhfcviurnbv jhbcehbc2e necu2h ebd 2udb iu2edb.
            </p>
          </div>
        </div>

        <div className="productCard-swiperWrap">
          <Swiper
            modules={[Navigation, Autoplay]}
            loop={products.length > 5}
            speed={2000}
            spaceBetween={20}
            slidesPerView={1}
            slidesPerGroup={1}
            autoplay={{
              delay: 1000,
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
            {products.map((item) => (
              <SwiperSlide key={item.id} className="productCard-slide">
                <ProductCardItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>

          {products.length > 1 && (
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
