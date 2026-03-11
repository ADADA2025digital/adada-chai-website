import React from "react";
import Banner from "../Components/Banner";
import ContactForm from "../Components/ContactForm";
import bannerBg from "../assets/images/about-banner.png";
import smicon from "../assets/images/smicon.png";
import { FaInstagram, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { motion } from "framer-motion";

const ContactUs = () => {
  return (
    <div className="container-fluid p-0">
      <Banner
        title="CONTACT US"
        subtitle="One tap... endless chai vibes."
        breadcrumb="HOME > CONTACT"
        bgImage={bannerBg}
      />

      <section className="contact-page-section py-5">
        <div className="container">
          <div className="row align-items-center gy-4">
            {/* Left Content */}
            <div className="col-lg-5 col-md-12">
              <motion.div
                className="contact-left-wrap h-100 text-center text-lg-start"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="contact-small-title d-inline-block text-uppercase mb-2">
                  Contact Now
                </span>

                <h2 className="contact-main-title mb-3">
                  Let’s Start <br className="d-none d-lg-block" /> With a Sip
                </h2>

                <p className="contact-description mx-4 mx-lg-0 mb-4">
                  It is a long established fact that a reader will be distracted by
                  the readable content of a page when looking at its layout. The
                  point of using Lorem Ipsum is that it has a more-or-less normal
                  distribution of letters, as opposed to using content here.
                </p>

                <div className="contact-socials d-flex justify-content-center justify-content-lg-start align-items-center gap-4">
                  <a href="#" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a href="#" aria-label="WhatsApp">
                    <FaWhatsapp />
                  </a>
                  <a href="#" aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right Form */}
            <div className="col-lg-7 col-md-12">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
              >
                <div className="text-center mb-3">
                  <img
                    src={smicon}
                    alt="icon"
                    className="img-fluid contact-form-topicon-img"
                  />
                </div>

                <ContactForm />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;