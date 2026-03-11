import React from "react";

const SmallCardItem = ({ card }) => {
  return (
    <div className="smallCard-card text-center">
      <div className="smallCard-innerCard">
        <img src={card.image} alt={card.title} className="smallCard-image img-fluid" />
      </div>

      <h4 className="smallCard-title">{card.title}</h4>
    </div>
  );
};

export default SmallCardItem;