import React from "react";

const ProductCardItem = ({ item }) => {
  return (
    <div className="productCard-card">
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