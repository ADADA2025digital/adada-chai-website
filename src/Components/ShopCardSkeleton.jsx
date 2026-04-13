import React from "react";

const ShopCardSkeleton = () => {
  return (
    <div className="shop-card w-100 my-0 mx-auto d-flex flex-column skeleton-card">
      
      {/* Top Section */}
      <div className="shop-card-top">
        <div className="skeleton rounded-4 skeleton-image"></div>

        {/* Floating Button */}
        <div className="skeleton rounded-circle position-absolute skeleton-badge"></div>
      </div>

      {/* Bottom Section */}
      <div className="shop-card-bottom">
        <div className="skeleton rounded skeleton-title"></div>
        <div className="skeleton rounded skeleton-text"></div>
        <div className="skeleton rounded skeleton-text short"></div>
        <div className="skeleton rounded skeleton-price"></div>
      </div>
    </div>
  );
};

export default ShopCardSkeleton;