import React from "react";
import badgeIcon from "../assets/images/smicon.png";

const ShopCard = ({ item }) => {
  return (
    <div className="shop-card text-center">
      <div className="shop-card-top">
        <img src={item.image} alt={item.title} className="img-fluid shop-card-image" />

        <div className="shop-card-badge">
          <img src={badgeIcon} alt="badge" className="shop-card-badge-img" />
        </div>
      </div>

      <div className="shop-card-bottom">
        <h4 className="shop-card-title">{item.title}</h4>
        <p className="shop-card-text">{item.description}</p>
      </div>
    </div>
  );
};

export default ShopCard;