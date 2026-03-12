import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Banner from "../Components/Banner";
import ShopCard from "../Components/ShopCard.jsx";
import bannerBg from "../assets/images/about-banner.png";
import smicon from "../assets/images/smicon.png";
import { shopData } from "../Constant/data";
import { FaSearch } from "react-icons/fa";

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

  const [sortBy, setSortBy] = useState("default");
  const [availability, setAvailability] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 12;

  const filteredProducts = useMemo(() => {
    let products = [...shopData];

    if (availability !== "all") {
      products = products.filter((item) => item.availability === availability);
    }

    if (status !== "all") {
      products = products.filter((item) => item.status === status);
    }

    if (searchTerm.trim()) {
      products = products.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === "low-high") {
      products.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "high-low") {
      products.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return products;
  }, [sortBy, availability, status, searchTerm]);

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
      (item) => item.id === product.id
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
                    className="w-100 d-flex justify-content-center"
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