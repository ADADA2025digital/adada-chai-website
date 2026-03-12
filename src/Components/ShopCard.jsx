import React from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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

const ShopCard = ({ item, onAddToCart }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${createProductSlug(item)}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddToCart(item);
  };

  return (
    <div
      className="shop-card text-center"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="shop-card-top">
        <img
          src={item.image}
          alt={item.title}
          className="img-fluid shop-card-image"
        />

        <button
          type="button"
          className="shop-card-badge"
          onClick={handleAddClick}
          aria-label={`Add ${item.title} to cart`}
        >
          <FaPlus className="shop-card-badge-icon" />
        </button>
      </div>

      <div className="shop-card-bottom">
        <h4 className="shop-card-title">{item.title}</h4>
        <p className="shop-card-text">{item.description}</p>
      </div>
    </div>
  );
};

export default ShopCard;