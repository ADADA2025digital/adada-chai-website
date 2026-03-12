import React from "react";
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

const ProductCardItem = ({ item }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${createProductSlug(item)}`);
  };

  return (
    <div
      className="productCard-card"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="productCard-cardTop">
        <img
          src={item.image}
          alt={item.title}
          className="img-fluid productCard-image"
        />
      </div>

      <div className="productCard-cardBottom">
        <h4 className="productCard-cardTitle">{item.title}</h4>
      </div>
    </div>
  );
};

export default ProductCardItem;