import React, { useState, useEffect } from "react";
import SmallCardItem from "../../Components/SmallCardItem";
import smicon from "../../assets/images/smicon.png";
import { categoryAPI, productAPI } from "../../Config/route";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/pagination";

const SmallCardSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoriesWithProductImages();
  }, []);

  const fetchCategoriesWithProductImages = async () => {
    try {
      setLoading(true);
      
      // Fetch both categories and products in parallel
      const [categoriesResponse, productsResponse] = await Promise.all([
        categoryAPI.getAllCategories(),
        productAPI.getAllProducts()
      ]);

      // Extract categories array
      let rawCategories = [];
      if (categoriesResponse.data && categoriesResponse.data.data) {
        rawCategories = categoriesResponse.data.data;
      } else if (Array.isArray(categoriesResponse.data)) {
        rawCategories = categoriesResponse.data;
      } else if (Array.isArray(categoriesResponse)) {
        rawCategories = categoriesResponse;
      } else {
        rawCategories = [];
      }

      // Extract products array
      let products = [];
      if (productsResponse && productsResponse.data) {
        products = productsResponse.data;
      } else if (Array.isArray(productsResponse)) {
        products = productsResponse;
      } else {
        products = [];
      }

      // Group products by category
      const productsByCategory = {};
      products.forEach(product => {
        const categoryId = product.c_id;
        if (!productsByCategory[categoryId]) {
          productsByCategory[categoryId] = [];
        }
        productsByCategory[categoryId].push(product);
      });

      // Transform categories and add image from first product in that category
      const transformedCategories = rawCategories.map((category) => {
        // Get products for this category
        const categoryProducts = productsByCategory[category.c_id] || [];
        
        // Find the first product that has an image
        let categoryImage = null;
        for (const product of categoryProducts) {
          if (product.assets && product.assets.length > 0 && product.assets[0].asset_url) {
            categoryImage = product.assets[0].asset_url;
            break;
          }
        }

        // Use default image if no product image found
        const finalImage = categoryImage || "/path/to/default-image.jpg";

        return {
          id: category.c_id,
          _id: category.c_id,
          title: category.category_name,
          description: category.category_description,
          image: finalImage,
          // Keep original data if needed
          ...category,
        };
      });

      setCategories(transformedCategories);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch categories with product images:", err);
      setError("Failed to load categories. Please try again later.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <section className="smallCard-section">
        <div className="container text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="smallCard-section">
        <div className="container text-center py-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </section>
    );
  }

  // Show no data message
  if (!categories || categories.length === 0) {
    return (
      <section className="smallCard-section">
        <div className="container text-center py-5">
          <p>No categories available.</p>
        </div>
      </section>
    );
  }

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
              <img
                src={smicon}
                alt="Tea Icon"
                className="smallCard-top-image"
              />
            </div>
          </div>
        </div>

        <div className="smallCard-swiper-wrap">
          <Swiper
            modules={[Autoplay, Pagination]}
            loop={categories.length > 4}
            speed={3000}
            spaceBetween={24}
            slidesPerView={1}
            slidesPerGroup={1}
            autoplay={{
              delay: 1000,
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
            {categories.map((category) => (
              <SwiperSlide
                key={category.id || category._id || Math.random()}
                className="smallCard-slide"
              >
                <SmallCardItem card={category} />
              </SwiperSlide>
            ))}
          </Swiper>

          {categories.length > 1 && (
            <div className="smallCard-swiper-pagination smallCard-indicators mt-4" />
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default SmallCardSection;