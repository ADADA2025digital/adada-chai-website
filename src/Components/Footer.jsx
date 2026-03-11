import React from "react";
import { FaInstagram, FaWhatsapp, FaFacebookF } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import footerImg from "../assets/images/footerImg.png";

const Footer = () => {
  return (
    <footer
      className="adada-footer"
      style={{
        backgroundImage: `url(${footerImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container-fluid p-0">

        <div className="adada-footer-overlay">

          <div className="container">
            <div className="row justify-content-center text-center">

              <div className="col-lg-6">

                {/* Logo */}
                <div className="adada-footer-logo">
                  <img src={logo} alt="Adada Chai" />
                </div>

                {/* Contact */}
                <h5 className="adada-footer-title">Contact</h5>

                <div className="adada-footer-contact">
                  <p>info@adada.com</p>
                  <p>+94 22 233 4566 786</p>
                  <p>+94 34 543 2334 233</p>
                </div>

                {/* Social */}
                <div className="adada-footer-social">
                  <a href="#">
                    <FaInstagram />
                  </a>

                  <a href="#">
                    <FaWhatsapp />
                  </a>

                  <a href="#">
                    <FaFacebookF />
                  </a>
                </div>

              </div>

            </div>
          </div>

        </div>

        <div className="adada-footer-bottom">
          <p>Copyright © 2025. All rights Reserved</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;