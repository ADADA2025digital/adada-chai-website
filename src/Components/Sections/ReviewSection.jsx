import React, { useState, useEffect } from "react";
import smicon from "../../assets/images/smicon.png";
import ReviewCardItem from "../ReviewCardItem.jsx";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { reviewAPI } from "../../Config/route";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewAPI.getAllReviews();
      // console.log("Fetched reviews data:", data);

      // Transform reviews to match ReviewCardItem expected format
      const transformedReviews = data.map((review) => {
        // Handle customer name - could be from user relationship or order
        let customerName = "Anonymous Customer";

        // Check if user data is included in the response
        if (review.user && review.user.name) {
          customerName = review.user.name;
        } else if (review.customer_name) {
          customerName = review.customer_name;
        } else if (review.name) {
          customerName = review.name;
        }

        // Get review text
        let reviewText =
          review.review_comment || review.comment || "No review text provided.";

        // Get rating
        let rating = review.rating || 5;

        // Get review images if needed (optional)
        const reviewImages = review.review_images || [];

        return {
          id: review.re_id || review.id,
          name: customerName,
          review: reviewText,
          rating: rating,
          rating_stars: rating,
          review_images: reviewImages,
          product_id: review.product_id,
          product_name: review.product?.product_name || "Product",
          created_at: review.created_at,
          // Keep original data
          ...review,
        };
      });

      // console.log("Transformed reviews:", transformedReviews);
      setReviews(transformedReviews);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError("Failed to load reviews. Please try again later.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <motion.section
        className="review-section"
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
        className="review-section"
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
  if (!reviews || reviews.length === 0) {
    return (
      <motion.section
        className="review-section"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container text-center py-5">
          <p>No reviews available yet.</p>
        </div>
      </motion.section>
    );
  }

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
              <img src={smicon} alt="Tea Icon" />
            </div>
            <h2 className="review-title">CUSTOMER REVIEWS</h2>
          </div>
        </div>

        <div className="review-swiperWrap">
          <Swiper
            modules={[Navigation, Autoplay]}
            loop={reviews.length > 4}
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
            {reviews.map((item) => (
              <SwiperSlide key={item.id} className="review-slide">
                <ReviewCardItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>

          {reviews.length > 1 && (
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
