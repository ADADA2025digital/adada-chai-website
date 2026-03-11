import React from "react";
import machine from "../assets/images/machine.png";
import machine2 from "../assets/images/coffeemachine.png";
import bag from "../assets/images/bag.png";
import cup from "../assets/images/cup.png";
import cup2 from "../assets/images/cup2.png";
import cinamon from "../assets/images/cinamon.png";
import ginger from "../assets/images/ginger.png";
import brownbag from "../assets/images/brownbag.png";
import leaf from "../assets/images/leaf.png";
import browncup from "../assets/images/browncup.png";
import browncinamon from "../assets/images/browncinamon.png";

import SmallCardSection from "../Components/Sections/SmallCardSection";
import ProductCardSection from "../Components/Sections/ProductCardSection";
import FaqSection from "../Components/Sections/FaqSection";
import TrustSection from "../Components/Sections/TrustSection";
import ReviewSection from "../Components/Sections/ReviewSection.jsx";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const Home = () => {
  const heroSlides = [
    {
      id: 1,
      title: (
        <>
          ADADA TEA <br /> VENDING MACHINE
        </>
      ),
      subtitle: "Happiness is a hot cup of tea.",
      description:
        "Lorem ipsum hdhyfie jsnckxeju hmxui2q qkbechec heb2wuch hwbecu2b ihed2ubd huwbdw hwcb uiewd2 ierfv uwecbhuie jnbcebnc2e ncu2h ebd 2udb iu2edb.",
      image: machine,
      alt: "Tea Machine",
    },
    {
      id: 2,
      title: (
        <>
          PREMIUM CHAI <br /> EXPERIENCE
        </>
      ),
      subtitle: "Fresh flavour in every single pour.",
      description:
        "Lorem ipsum hdhyfie jsnckxeju hmxui2q qkbechec heb2wuch hwbecu2b ihed2ubd huwbdw hwcb uiewd2 ierfv uwecbhuie jnbcebnc2e ncu2h ebd 2udb iu2edb.",
      image: machine2,
      alt: "Premium Tea Machine",
    },
    {
      id: 3,
      title: (
        <>
          SMART TEA <br /> DISPENSING SYSTEM
        </>
      ),
      subtitle: "Serve quality tea anytime, anywhere.",
      description:
        "Lorem ipsum hdhyfie jsnckxeju hmxui2q qkbechec heb2wuch hwbecu2b ihed2ubd huwbdw hwcb uiewd2 ierfv uwecbhuie jnbcebnc2e ncu2h ebd 2udb iu2edb.",
      image: machine,
      alt: "Smart Tea Vending Machine",
    },
  ];

  return (
    <div className="container-fluid p-0">
      {/* HERO SECTION */}
      <section className="hero-section">
        <img src={bag} alt="Bag" className="hero-overlay hero-bag" />
        <img src={cup} alt="Cup" className="hero-overlay hero-cup" />
        <img src={cup2} alt="Cup 2" className="hero-overlay hero-cup2" />
        <img
          src={cinamon}
          alt="Cinamon"
          className="hero-overlay hero-cinamon"
        />

        <div className="container hero-container">
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            loop={true}
            speed={4000}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            pagination={{
              clickable: true,
              el: ".hero-swiper-pagination",
            }}
            className="hero-swiper"
          >
            {heroSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="row g-0 align-items-center hero-row">
                  <div className="col-lg-7 col-md-12">
                    <div className="hero-left">
                      <h1 className="hero-title">{slide.title}</h1>
                      <p className="hero-subtitle">{slide.subtitle}</p>
                      <p className="hero-description">{slide.description}</p>
                    </div>
                  </div>

                  <div className="col-lg-5 col-md-12">
                    <div className="hero-right">
                      <img
                        src={slide.image}
                        alt={slide.alt}
                        className="hero-machine img-fluid"
                      />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="hero-swiper-pagination"></div>
        </div>
      </section>

      {/* SMALL CARD SECTION */}
      <section className="smallCard-section section-decor-wrap">
        <img src={leaf} alt="Ginger" className="section-decor small-leaf" />
        <img src={brownbag} alt="Bag" className="section-decor small-bag" />
        <div className="section-content">
          <SmallCardSection />
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <section className="productCard-section py-5 section-decor-wrap">
        <img
          src={browncup}
          alt="Cup"
          className="section-decor product-browncup-left"
        />
        <div className="section-content">
          <ProductCardSection />
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section py-5 section-decor-wrap">
        <img src={cup2} alt="Cup 2" className="section-decor faq-cup-right" />
        <div className="section-content">
          <FaqSection />
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="trust-section py-5 section-decor-wrap">
        <img
          src={ginger}
          alt="Ginger"
          className="section-decor trust-ginger-left"
        />
        <img src={cup} alt="Cup" className="section-decor trust-cup-right" />
        <div className="section-content">
          <TrustSection />
        </div>
      </section>

      {/* REVIEW SECTION */}
      <section className="review-section py-5 section-decor-wrap">
        <img
          src={browncinamon}
          alt="Cinamon"
          className="section-decor review-browncinamon-left"
        />
        <div className="section-content">
          <ReviewSection />
        </div>
      </section>
    </div>
  );
};

export default Home;