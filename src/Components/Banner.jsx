import React from "react";

const Banner = ({ title, breadcrumb, subtitle, bgImage }) => {
  return (
    <section
      className="inner-banner d-flex align-items-center border-top border-bottom"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 29, 29, 0.62), rgba(43, 43, 43, 0.62)), url(${bgImage})`,
      }}
    >
      <div className="container h-100">
        <div className="row h-100 align-items-center text-center text-lg-start ps-lg-5 pt-5 pt-md-4 pt-3 pb-4 pb-md-3 pb-lg-0">
          
          <div className="col-lg-6 col-md-7 col-12">
            <div className="inner-banner-content mt-lg-5 pt-lg-5 mt-4 pt-0">
              <h1 className="inner-banner-title text-uppercase fw-bold mb-1">
                {title}
              </h1>

              {subtitle && (
                <p className="inner-banner-subtitle fst-italic fw-medium mb-0">
                  “{subtitle}”
                </p>
              )}
            </div>
          </div>

          <div className="col-lg-6 col-md-5 col-12 mt-3 mt-lg-5">
            <div className="inner-banner-breadcrumb text-center text-lg-end pb-2 pe-2 pb-md-0">
              {breadcrumb}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Banner;