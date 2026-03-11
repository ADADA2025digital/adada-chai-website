import React from "react";

const TrustLogoItem = ({ logo }) => {
  return (
    <div className="trust-logo-item">
      <img
        src={logo.image}
        alt={logo.name}
        className="img-fluid trust-logo-img"
      />
    </div>
  );
};

export default TrustLogoItem;