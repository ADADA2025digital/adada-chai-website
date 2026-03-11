import React from "react";

const FeatureCard = ({ data }) => {
  return (
    <div className="feature-card">

      <div className="feature-card-inner">

        <div className="feature-icon">
          <img src={data.icon} alt="feature" />
        </div>

        <h4>{data.title}</h4>

        <p>{data.description}</p>

      </div>

      <div className="feature-readmore">
        Read More →
      </div>

    </div>
  );
};

export default FeatureCard;