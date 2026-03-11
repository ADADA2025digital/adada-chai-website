import React from "react";

const ReviewCardItem = ({ item }) => {
  return (
    <div className="review-card">
      <div className="review-stars">
        {"★".repeat(item.rating)}
      </div>

      <h4 className="review-name">{item.name}</h4>

      <p className="review-text">{item.review}</p>
    </div>
  );
};

export default ReviewCardItem;