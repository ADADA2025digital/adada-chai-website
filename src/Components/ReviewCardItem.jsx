import React from "react";

const ReviewCardItem = ({ item }) => {
  // Generate star rating based on numeric rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`star-${i}`} className="star-full">
          ★
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="star-half">
          ½
        </span>,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star-empty">
          ☆
        </span>,
      );
    }

    return stars;
  };

  return (
    <div className="review-card">
      <div className="review-stars">{renderStars(item.rating)}</div>

      <h4 className="review-name">{item.name}</h4>

      <p className="review-text">{item.review}</p>
    </div>
  );
};

export default ReviewCardItem;
