import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Banner from "../Components/Banner";
import ShopCard from "../Components/ShopCard.jsx";
import ShopCardSkeleton from "../Components/ShopCardSkeleton.jsx";
import bannerBg from "../assets/images/about-banner.png";
import smicon from "../assets/images/smicon.png";
import { FaSearch } from "react-icons/fa";
import { productAPI } from "../Config/route";

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

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState("default");
  const [availability, setAvailability] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 12;

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAllProducts();
      // console.log("Fetched products data:", data);

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

      // Transform products to match ShopCard expected format
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
            let url = imageAsset.asset_url;
            if (url.startsWith("/storage") || url.startsWith("storage")) {
              imageUrl = `http://127.0.0.1:8000/${url}`;
            } else if (
              !url.startsWith("http://") &&
              !url.startsWith("https://")
            ) {
              imageUrl = `http://127.0.0.1:8000/storage/${url}`;
            } else {
              imageUrl = url;
            }
          } else if (product.assets[0] && product.assets[0].asset_url) {
            let url = product.assets[0].asset_url;
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
              imageUrl = `http://127.0.0.1:8000/storage/${url}`;
            } else {
              imageUrl = url;
            }
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

        return {
          id: product.product_id || product.id,
          title: product.product_name || product.name || "Untitled Product",
          description:
            product.description ||
            product.specification ||
            "No description available",
          price: product.sell_price || product.price || 0,
          image: imageUrl,
          availability: product.quantity > 0 ? "in-stock" : "out-of-stock",
          status: product.product_status === "active" ? "new" : "sale",
          quantity: product.quantity || 0,
          sku: product.sku,
          specification: product.specification,
          discount: product.discount,
          category: product.category,
          // Keep original data
          ...product,
        };
      });

      // console.log("Transformed products for shop:", transformedProducts);
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

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (availability !== "all") {
      filtered = filtered.filter((item) => item.availability === availability);
    }

    if (status !== "all") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (sortBy === "low-high") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "high-low") {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return filtered;
  }, [products, sortBy, availability, status, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, availability, status, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAddToCart = (product) => {
    const existingCart = JSON.parse(localStorage.getItem("adadaCart")) || [];

    const existingIndex = existingCart.findIndex(
      (item) => item.id === product.id,
    );

    if (existingIndex !== -1) {
      existingCart[existingIndex].quantity += 1;
    } else {
      existingCart.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem("adadaCart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleProductClick = (product) => {
    navigate(`/product/${createProductSlug(product)}`);
  };

if (loading) {
  return (
    <div className="container-fluid p-0">
      <Banner
        title="SHOP"
        subtitle="Hot chai, always ready."
        breadcrumb="HOME > SHOP"
        bgImage={bannerBg}
      />

      <section className="shop-page-section">
        <div className="container">
          <div className="row pt-4 pt-md-5 gx-3 gy-4 gy-md-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 py-5 d-flex justify-content-center"
              >
                <ShopCardSkeleton />
              </div>
            ))}
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
          title="SHOP"
          subtitle="Hot chai, always ready."
          breadcrumb="HOME > SHOP"
          bgImage={bannerBg}
        />
        <section className="shop-page-section">
          <div className="container text-center py-5">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <Banner
        title="SHOP"
        subtitle="Hot chai, always ready."
        breadcrumb="HOME > SHOP"
        bgImage={bannerBg}
      />

      <section className="shoptop-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-3 mb-md-4">
              <div className="shop-page-topicon">
                <img
                  src={smicon}
                  alt="icon"
                  className="img-fluid shop-page-topicon-img"
                />
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-12 col-xl-10">
              <div className="shop-filter-bar">
                <div className="row g-3 justify-content-center">
                  <div className="col-12 col-sm-6 col-md-6 col-lg-3">
                    <select
                      className="form-select shop-filter-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">Default Sorting</option>
                      <option value="low-high">Price Low to High</option>
                      <option value="high-low">Price High to Low</option>
                    </select>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-3">
                    <select
                      className="form-select shop-filter-select"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                    >
                      <option value="all">Availability</option>
                      <option value="in-stock">In Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-2">
                    <select
                      className="form-select shop-filter-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="all">Select Status</option>
                      <option value="new">New</option>
                      <option value="featured">Featured</option>
                      <option value="sale">Sale</option>
                    </select>
                  </div>

                  <div className="col-12 col-sm-6 col-md-6 col-lg-4">
                    <div className="shop-search-wrap">
                      <input
                        type="text"
                        className="form-control shop-search-input pe-5"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button type="button" className="shop-search-btn">
                        <FaSearch />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shop-page-section">
        <div className="container">
          <div className="row pt-4 pt-md-5 gx-3 gy-4 gy-md-5">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((item, index) => (
                <div
                  className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 py-5 d-flex justify-content-center"
                  key={item.id}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.7,
                      delay: index * 0.08,
                      ease: "easeOut",
                    }}
          className="w-100 d-flex"
                  >
                    <ShopCard
                      item={item}
                      onAddToCart={handleAddToCart}
                      onClick={() => handleProductClick(item)}
                    />
                  </motion.div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <h5 className="mb-0">No products found.</h5>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="row">
              <div className="col-12">
                <div className="shop-pagination d-flex justify-content-center align-items-center flex-wrap gap-2 pt-4 pt-md-5 pb-4 pb-md-5">
                  <button
                    className="shop-page-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        className={`shop-page-btn ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    className="shop-page-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Shop;
