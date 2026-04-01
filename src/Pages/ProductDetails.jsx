import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Banner from "../Components/Banner";
import bannerBg from "../assets/images/about-banner.png";
import smicon from "../assets/images/smicon.png";
import { productAPI } from "../Config/route";
import {
  FaPlus,
  FaMinus,
  FaStar,
  FaStarHalfAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const slugify = (text) => {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const createProductSlug = (product) => {
  return `${slugify(product.title)}`;
};

// Helper function to sanitize and preserve HTML formatting
const sanitizeAndPreserveHtml = (html) => {
  if (!html) return "";
  
  // Only remove dangerous tags, preserve formatting
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:/gi, '');
};

// Helper function to strip HTML tags and clean text (for meta descriptions)
const stripHtmlTags = (html) => {
  if (!html) return "";
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  let text = tempDiv.textContent || tempDiv.innerText || '';
  text = text.replace(/\s+/g, ' ').trim();
  text = text.replace(/&nbsp;/g, ' ').trim();
  
  return text;
};

// Helper function to safely truncate text if needed
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [recommendIndex, setRecommendIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAllProducts();

      // Extract products array
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

      // Transform products to match the expected format
      const transformedProducts = productsArray.map((product) => {
        // Extract image URL from assets
        let imageUrl = null;

        if (
          product.assets &&
          Array.isArray(product.assets) &&
          product.assets.length > 0
        ) {
          const imageAsset = product.assets.find(
            (asset) => asset.asset_url && asset.asset_type === "image",
          );

          if (imageAsset && imageAsset.asset_url) {
            imageUrl = imageAsset.asset_url;
          } else if (product.assets[0] && product.assets[0].asset_url) {
            imageUrl = product.assets[0].asset_url;
          }
        }

        // Fallback to placeholder
        if (!imageUrl) {
          const colors = ["FF6B6B", "4ECDC4", "45B7D1", "96CEB4", "FFEAA7"];
          const hash = (product.product_name || "")
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const color = colors[hash % colors.length];
          const text = encodeURIComponent(product.product_name || "Product");
          imageUrl = `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${text}`;
        }

        // Calculate discounted price if discount exists
        let finalPrice = parseFloat(product.sell_price) || 0;
        if (product.discount && product.discount.discount_percentage) {
          const discountPercent = parseFloat(
            product.discount.discount_percentage,
          );
          finalPrice = finalPrice * (1 - discountPercent / 100);
        }

        // Safely extract category info (handle if category is an object or string)
        let categoryName = "General";
        let categoryDescription = "";

        if (product.category) {
          if (typeof product.category === "object") {
            categoryName = product.category.category_name || "General";
            categoryDescription = product.category.category_description || "";
          } else if (typeof product.category === "string") {
            categoryName = product.category;
          }
        }

        // Preserve HTML formatting for description and specification
        const cleanDescription = sanitizeAndPreserveHtml(product.description);
        const cleanSpecification = sanitizeAndPreserveHtml(product.specification);
        
        // Strip HTML for category description (used in meta text)
        const plainCategoryDescription = stripHtmlTags(product.description);

        return {
          id: product.product_id || product.id,
          title: product.product_name || product.name || "Untitled Product",
          description: cleanDescription || "No description available",
          price: finalPrice,
          original_price: parseFloat(product.sell_price) || 0,
          image: imageUrl,
          availability: product.quantity > 0 ? "In Stock" : "Out of Stock",
          category: categoryName,
          categoryDescription: plainCategoryDescription ? truncateText(plainCategoryDescription, 100) : categoryDescription,
          specification: cleanSpecification || "No specifications available",
          quantity: product.quantity || 0,
          sku: product.sku,
          discount: product.discount,
          rating: 4.5,
          reviewCount: 0,
          product_status: product.product_status,
        };
      });

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

  // Find the current product based on slug
  const product = useMemo(() => {
    if (!products.length) return null;

    return products.find((item) => {
      if (String(item.id) === String(slug)) return true;
      return createProductSlug(item) === String(slug);
    });
  }, [products, slug]);

  // Get recommendations (all other products)
  const recommendations = useMemo(() => {
    if (!product) return [];
    return products.filter((item) => item.id !== product.id);
  }, [product, products]);

  const visibleRecommendations = recommendations.slice(
    recommendIndex,
    recommendIndex + 3,
  );

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const updateCart = (qtyToAdd) => {
    if (!product) return;

    const existingCart = JSON.parse(localStorage.getItem("adadaCart")) || [];

    const existingIndex = existingCart.findIndex(
      (item) => item.id === product.id,
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

  // Render stars based on rating
  const renderStars = () => {
    const rating = product?.rating || 4.5;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} />
        ))}
        {hasHalfStar && <FaStarHalfAlt />}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <FaStar key={`empty-${i}`} style={{ color: "#ddd" }} />
        ))}
      </>
    );
  };

  // Show loading state
  if (loading) {
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
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show error state
  if (error) {
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
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Show not found state
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
            <p className="small text-muted mt-2">URL slug: {slug}</p>
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
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x300?text=No+Image";
                  }}
                />
              </motion.div>
            </div>

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
                    {renderStars()}
                  </span>
                  <span className="small product-meta-text">
                    {product.rating}
                  </span>
                  <span className="small product-meta-text">
                    {product.reviewCount} Review
                  </span>
                </div>

                <div className="fw-bold mb-3 product-price">
                  ${Number(product.price).toFixed(2)}
                  {product.original_price > product.price && (
                    <span className="text-decoration-line-through ms-2 small text-muted">
                      ${Number(product.original_price).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Product description with HTML formatting preserved */}
                <div 
                  className="mb-3 product-description"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />

                <div className="mb-3">
                  <p className="mb-1 product-info-text">
                    <strong>Availability :</strong> {product.availability}
                  </p>
                  <p className="mb-1 product-info-text">
                    <strong>Category :</strong> {product.category}
                  </p>
                  {product.categoryDescription && (
                    <p className="mb-1 product-info-text">
                      <strong>Category Description :</strong>{" "}
                      {product.categoryDescription}
                    </p>
                  )}
                  
                  {/* Specification with HTML formatting preserved */}
                  {product.specification && (
                    <>
                      <p className="mb-1 product-info-text">
                        <strong>Specification :</strong>
                      </p>
                      <div 
                        className="mb-1 product-info-text product-specification"
                        dangerouslySetInnerHTML={{ __html: product.specification }}
                      />
                    </>
                  )}
                  
                  {product.discount && product.discount.discount_percentage && (
                    <p className="mb-1 product-info-text">
                      <strong>Discount :</strong>{" "}
                      {product.discount.discount_percentage}% off
                    </p>
                  )}
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

            <div className="col-12 col-md-5 col-lg-4">
              <motion.div className="recommendation-card p-3 rounded-4 mx-auto">
                <h5 className="fw-bold mb-3 recommendation-title">
                  Our Recommendation
                </h5>

                <div className="d-flex flex-column gap-3">
                  {visibleRecommendations.map((item) => (
                    <motion.div
                      key={item.id}
                      className="d-flex align-items-start gap-3 recommendation-item"
                      onClick={() =>
                        navigate(`/product/${createProductSlug(item)}`)
                      }
                      role="button"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="recommend-image-box d-flex align-items-center justify-content-center rounded-3 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="img-fluid recommend-image"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/80x80?text=No+Image";
                          }}
                        />
                      </div>

                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1 recommend-item-title">
                          {item.title}
                        </h6>
                        <div 
                          className="mb-1 recommend-item-desc"
                          dangerouslySetInnerHTML={{ 
                            __html: stripHtmlTags(item.description).substring(0, 60) + "..."
                          }}
                        />
                        <span className="fw-bold recommend-item-price">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {recommendations.length > 3 && (
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
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;