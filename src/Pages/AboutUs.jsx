import React from "react";
import Banner from "../Components/Banner";
import bannerBg from "../assets/images/about-banner.png";
import machine from "../assets/images/coffeemachine.png";
import smicon from "../assets/images/smicon.png";
import FeaturesSection from "../Components/Sections/FeaturesSection";
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <div className="container-fluid p-0">
      <Banner
        title="ABOUT US"
        subtitle="Swipe → Sip → Smile."
        breadcrumb="HOME > ABOUT"
        bgImage={bannerBg}
      />

      <section className="about-page-section py-4 py-lg-5">
        <div className="container">
          <div className="row align-items-center gy-4 gy-lg-0">
            {/* Left Image */}
            <div className="col-lg-4 col-12 text-center about-page-left">
              <div className="about-page-machine-wrap">
                <img
                  src={machine}
                  alt="Tea Machine"
                  className="img-fluid about-page-machine"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="col-lg-8 col-12">
              <motion.div
                className="about-page-content text-center text-lg-start mx-auto"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <div className="about-page-topicon mb-2">
                  <img
                    src={smicon}
                    alt="Icon"
                    className="about-page-topicon-img img-fluid"
                  />
                </div>

                <h2 className="about-page-title fw-bold text-uppercase mb-3">
                  ABOUT US
                </h2>

                <p className="about-page-text mb-4 mx-4 mx-lg-0">
                  It is a long established fact that a reader will be distracted
                  by of a page when looking at its layout. The point of using
                  Lorem Ipsum is more-or-less normal distribution of letters, as
                  opposed to using "Content content here", making it look like
                  readable English. Many desktop packages and web page editors
                  now use Lorem Ipsum as their default and a search for "lorem
                  ipsum" will uncover many web sites still in their various
                  versions have evolved over the years, sometimes by accident,
                  on purpose (injected humour and the like).
                </p>

                <div className="about-page-quote-wrap d-flex align-items-start justify-content-center justify-content-lg-start mx-4 mx-lg-0">
                  <div className="about-page-quote-line flex-shrink-0"></div>

                  <p className="about-page-quote-text mb-0 text-center text-lg-start">
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="feature">
        <FeaturesSection />
      </section>
    </div>
  );
};

export default AboutUs;
