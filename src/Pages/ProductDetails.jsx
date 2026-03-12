import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Banner from "../Components/Banner";
import bannerBg from "../assets/images/about-banner.png";
import smicon from "../assets/images/smicon.png";
import { shopData } from "../Constant/data";
import {
  FaPlus,
  FaMinus,
  FaStar,
  FaStarHalfAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [recommendIndex, setRecommendIndex] = useState(0);

  const product = shopData.find((item) => String(item.id) === String(id));

  const recommendations = useMemo(() => {
    return shopData.filter((item) => String(item.id) !== String(id));
  }, [id]);

  const visibleRecommendations = recommendations.slice(
    recommendIndex,
    recommendIndex + 3
  );

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const updateCart = (qtyToAdd) => {
    const existingCart = JSON.parse(localStorage.getItem("adadaCart")) || [];

    const existingIndex = existingCart.findIndex(
      (item) => item.id === product.id
    );

    if (existingIndex !== -1) {
      existingCart[existingIndex].quantity += qtyToAdd;
    } else {
      existingCart.push({
        ...product,
        quantity: qtyToAdd,
      });
    }

    localStorage.setItem("adadaCart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleAddToCart = () => {
    updateCart(quantity);
  };

  const handlePlaceOrder = () => {
    updateCart(quantity);
    navigate("/checkout");
  };

  const handlePrevRecommendation = () => {
    setRecommendIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNextRecommendation = () => {
    if (recommendIndex + 3 < recommendations.length) {
      setRecommendIndex((prev) => prev + 1);
    }
  };

  if (!product) {
    return (
      <div className="container-fluid p-0">
        <Banner
          title="PRODUCT DETAILS"
          subtitle="Find your perfect chai partner."
          breadcrumb="HOME > SHOP > PRODUCT"
          bgImage={bannerBg}
        />

        <section className="product-details-section py-5">
          <div className="container text-center py-5">
            <h3 className="fw-bold mb-3">Product not found</h3>
            <p className="mb-0 text-muted">
              The product you are looking for does not exist.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <Banner
        title="PRODUCT DETAILS"
        subtitle="Hot chai, always ready."
        breadcrumb={`HOME > SHOP > ${product.title}`}
        bgImage={bannerBg}
      />

      <section className="product-details-section py-5 py-lg-6">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-4">
              <motion.img
                src={smicon}
                alt="icon"
                className="img-fluid"
                style={{ maxWidth: "70px" }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="row g-4 g-xl-5 align-items-start">
            {/* LEFT IMAGE */}
            <div className="col-12 col-lg-4">
              <motion.div
                className="d-flex justify-content-center align-items-start h-100"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.85, ease: "easeOut" }}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="img-fluid product-main-image"
                />
              </motion.div>
            </div>

            {/* CENTER CONTENT */}
            <div className="col-12 col-md-7 col-lg-4 p-5 p-lg-0">
              <motion.div
                className="pt-0 pt-lg-4"
                key={product.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
              >
                <h2 className="text-uppercase fw-bold lh-sm mb-2 product-title">
                  {product.title}
                </h2>

                <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
                  <span className="d-inline-flex align-items-center gap-1 product-stars">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStarHalfAlt />
                  </span>
                  <span className="small product-meta-text">4.0</span>
                  <span className="small product-meta-text">5 Review</span>
                </div>

                <div className="fw-bold mb-3 product-price">
                  ${Number(product.price || 0).toFixed(2)}
                </div>

                <p className="mb-3 product-description">
                  {product.description ||
                    "Lorem ipsum yuegl uqvgdi yugduyl yqgwdyl2 byhgdfuyl wuigf hiehfgj8hgf uegfhyu3gf qfghigf iuwefih"}
                </p>

                <div className="mb-3">
                  <p className="mb-1 product-info-text">
                    <strong>Availability :</strong>{" "}
                    {product.availability || "In Stock"}
                  </p>
                  <p className="mb-1 product-info-text">
                    <strong>Category :</strong>{" "}
                    {product.category || "Chai Machine"}
                  </p>
                  <p className="mb-1 product-info-text">
                    <strong>Category Description :</strong>{" "}
                    {product.categoryDescription ||
                      "Premium vending solution for tea service"}
                  </p>
                  <p className="mb-1 product-info-text">
                    <strong>Specification :</strong>{" "}
                    {product.specification ||
                      "Reliable performance, easy maintenance, premium quality"}
                  </p>
                </div>

                <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-2 gap-md-3 w-100">
                  <div
                    className="d-flex align-items-center justify-content-between flex-shrink-0 rounded-3"
                    style={{
                      border: "1px solid #caa57c",
                      background: "#f5dfbd",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleDecrease}
                      className="btn border-0 rounded-0 shadow-none d-flex align-items-center justify-content-center px-3"
                      style={{ height: "48px", color: "#8f6238" }}
                    >
                      <FaMinus />
                    </button>

                    <span
                      className="fw-bold text-center flex-grow-1"
                      style={{
                        color: "#3b2a20",
                        fontSize: "14px",
                        minWidth: "60px",
                      }}
                    >
                      {String(quantity).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      onClick={handleIncrease}
                      className="btn border-0 rounded-0 shadow-none d-flex align-items-center justify-content-center px-3"
                      style={{ height: "48px", color: "#8f6238" }}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="btn fw-bold px-3 py-2 rounded-pill flex-grow-1 flex-md-grow-0"
                    style={{
                      background: "#d9932f",
                      color: "#2f2118",
                      border: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="btn fw-bold px-3 py-2 rounded-pill flex-grow-1 flex-md-grow-0"
                    style={{
                      background: "#d9932f",
                      color: "#2f2118",
                      border: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Place Order
                  </button>
                </div>
              </motion.div>
            </div>

            {/* RIGHT RECOMMENDATION */}
            <div className="col-12 col-md-5 col-lg-4">
              <motion.div
                className="recommendation-card p-3 rounded-4 mx-auto"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.95, delay: 0.15, ease: "easeOut" }}
              >
                <h5 className="fw-bold mb-3 recommendation-title">
                  Our Recommendation
                </h5>

                <div className="d-flex flex-column gap-3">
                  {visibleRecommendations.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="d-flex align-items-start gap-3 recommendation-item"
                      onClick={() => navigate(`/product/${item.id}`)}
                      role="button"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.08,
                        ease: "easeOut",
                      }}
                    >
                      <div className="recommend-image-box d-flex align-items-center justify-content-center rounded-3 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="img-fluid recommend-image"
                        />
                      </div>

                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1 recommend-item-title">
                          {item.title}
                        </h6>
                        <p className="mb-1 recommend-item-desc">
                          {item.description ||
                            "Lorem ipsum yuegl uqvgdi vulgi hiehfgj8hgf uegfh"}
                        </p>
                        <span className="fw-bold recommend-item-price">
                          ${Number(item.price || 0).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handlePrevRecommendation}
                    disabled={recommendIndex === 0}
                    className="btn btn-sm recommendation-nav-btn"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextRecommendation}
                    disabled={recommendIndex + 3 >= recommendations.length}
                    className="btn btn-sm recommendation-nav-btn"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;