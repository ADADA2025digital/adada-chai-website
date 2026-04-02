import React, { useState, useEffect, useMemo } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaBars,
  FaTimes,
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
} from "react-icons/fa";
import logo from "../assets/images/logo.png";

const Header = () => {
  const navigate = useNavigate();

  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Calculate subtotal with discounted prices
  const subTotal = useMemo(
    () => cartItems.reduce((sum, item) => {
      const originalPrice = parseFloat(item.price);
      const discountPercent = item.discount ? parseFloat(item.discount) : 0;
      const finalPrice = discountPercent > 0 
        ? originalPrice * (1 - discountPercent / 100)
        : originalPrice;
      return sum + finalPrice * item.quantity;
    }, 0),
    [cartItems],
  );

  // Count unique products
  const cartCount = useMemo(
    () => cartItems.length,
    [cartItems],
  );

  const navigationLinks = [
    { to: "/", label: "Home", type: "link" },
    { to: "/about", label: "About", type: "link" },
    { to: "/shop", label: "Shop", type: "link" },
    { to: "/rent", label: "Rent/Lease", type: "link" },
    { to: "/contact", label: "Contact", type: "link" },
    { to: "/cart", label: `Cart (${cartCount})`, type: "cart" },
  ];

  const contactInfo = {
    email: "info@adada.com",
    phone: "0451112478",
    socials: [
      { icon: <FaInstagram />, label: "Instagram", url: "#" },
      { icon: <FaWhatsapp />, label: "WhatsApp", url: "#" },
      { icon: <FaFacebookF />, label: "Facebook", url: "#" },
    ],
  };

  const loadCartFromStorage = () => {
    const storedCart = JSON.parse(localStorage.getItem("adadaCart")) || [];
    // Process cart items to ensure all fields exist
    const processedCart = storedCart.map((item) => ({
      ...item,
      price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
      discount: item.discount || 0, // Default to 0 if no discount
      finalPrice: item.finalPrice || (typeof item.price === "string" ? parseFloat(item.price) : item.price),
      quantity: typeof item.quantity === "string" ? parseInt(item.quantity) : item.quantity,
    }));
    setCartItems(processedCart);
  };

  useEffect(() => {
    loadCartFromStorage();

    const handleResize = () => {
      if (window.innerWidth > 991) {
        setShowOffcanvas(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleCartUpdated = () => {
      loadCartFromStorage();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    if (showOffcanvas || showCartDrawer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showOffcanvas, showCartDrawer]);

  const openCartDrawer = () => {
    loadCartFromStorage();
    setShowOffcanvas(false);
    setShowCartDrawer(true);
  };

  const closeCartDrawer = () => {
    setShowCartDrawer(false);
  };

  const updateCartAndStorage = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("adadaCart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const decreaseQty = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
        : item,
    );
    updateCartAndStorage(updatedCart);
  };

  const increaseQty = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
    );
    updateCartAndStorage(updatedCart);
  };

  const removeCartItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    updateCartAndStorage(updatedCart);
  };

  // Helper function to calculate display price
  const getDisplayPrice = (item) => {
    const originalPrice = parseFloat(item.price);
    const discountPercent = item.discount ? parseFloat(item.discount) : 0;
    if (discountPercent > 0) {
      return originalPrice * (1 - discountPercent / 100);
    }
    return originalPrice;
  };

  return (
    <>
      <header
        className="adada-header-wrapper position-absolute top-0 start-0 w-100"
        style={{ zIndex: 1000 }}
      >
        <div
          className={`adada-topbar ${
            isScrolled ? "adada-topbar-hide" : ""
          } d-none d-lg-block`}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 col-12">
                <div className="adada-topbar-left d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                  <a
                    href="mailto:info@adada.com"
                    className="adada-top-link text-decoration-none"
                  >
                    <FaEnvelope className="me-2" />
                    info@adada.com
                  </a>

                  <span className="adada-divider d-none d-md-inline">|</span>

                  <a
                    href="tel:0451112478"
                    className="adada-top-link text-decoration-none"
                  >
                    <FaPhoneAlt className="me-2" />
                    0451112478
                  </a>
                </div>
              </div>

              <div className="col-lg-6 col-12">
                <div className="adada-topbar-right d-flex align-items-center justify-content-center justify-content-lg-end mt-2 mt-lg-0">
                  <a
                    href="#"
                    className="adada-social-link"
                    aria-label="Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="#"
                    className="adada-social-link"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp />
                  </a>
                  <a
                    href="#"
                    className="adada-social-link"
                    aria-label="Facebook"
                  >
                    <FaFacebookF />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`adada-mainnav ${
            isScrolled ? "bg-black adada-mainnav-fixed" : "bg-transparent"
          }`}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-4 col-6">
                <Link to="/" className="text-decoration-none d-inline-block">
                  <img
                    src={logo}
                    alt="ADADA Chai"
                    className="img-fluid adada-logo"
                  />
                </Link>
              </div>

              <div className="col-lg-8 d-none d-lg-block">
                <div className="d-flex justify-content-end">
                  <ul className="adada-nav-pill list-unstyled mb-0 d-flex align-items-center">
                    {navigationLinks.map((link) => (
                      <li key={link.label}>
                        {link.type === "cart" ? (
                          <button
                            type="button"
                            className="adada-nav-link adada-cart-btn"
                            onClick={openCartDrawer}
                          >
                            {link.label}
                          </button>
                        ) : (
                          <NavLink
                            to={link.to}
                            className={({ isActive }) =>
                              `adada-nav-link ${isActive ? "active" : ""}`
                            }
                          >
                            {link.label}
                          </NavLink>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-6 d-lg-none">
                <div className="d-flex justify-content-end align-items-center gap-2">
                  <button
                    type="button"
                    className="adada-mobile-cart-btn-header position-relative"
                    onClick={openCartDrawer}
                    aria-label="Open Cart"
                  >
                    <FaShoppingCart />
                    {cartCount > 0 && (
                      <span className="adada-mobile-cart-count">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="adada-menu-btn"
                    onClick={() => setShowOffcanvas(true)}
                    aria-label="Open Menu"
                  >
                    <FaBars />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showOffcanvas && (
        <div
          className="adada-mobile-backdrop"
          onClick={() => setShowOffcanvas(false)}
        ></div>
      )}

      <div className={`adada-mobile-menu ${showOffcanvas ? "show" : ""}`}>
        <div className="adada-mobile-header d-flex align-items-center justify-content-between">
          <img
            src={logo}
            alt="ADADA CHAI"
            className="img-fluid adada-mobile-logo"
          />

          <button
            type="button"
            className="adada-close-btn"
            onClick={() => setShowOffcanvas(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="adada-mobile-body">
          <ul className="list-unstyled mb-4 text-center">
            {navigationLinks.map((link) => (
              <li key={link.label}>
                {link.type === "cart" ? (
                  <button
                    type="button"
                    className="adada-mobile-link adada-mobile-cart-btn text-center"
                    onClick={openCartDrawer}
                  >
                    {link.label}
                  </button>
                ) : (
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `adada-mobile-link ${isActive ? "active" : ""}`
                    }
                    onClick={() => setShowOffcanvas(false)}
                  >
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          <div className="adada-mobile-contact-info mb-4 text-center">
            <h6 className="adada-mobile-section-title">Contact Us</h6>
            <a
              href={`mailto:${contactInfo.email}`}
              className="adada-mobile-contact-item text-decoration-none d-block mb-2"
            >
              <FaEnvelope className="me-2" />
              {contactInfo.email}
            </a>
            <a
              href={`tel:${contactInfo.phone}`}
              className="adada-mobile-contact-item text-decoration-none d-block"
            >
              <FaPhoneAlt className="me-2" />
              {contactInfo.phone}
            </a>
          </div>

          <div className="adada-mobile-socials d-flex flex-column align-items-center justify-content-center text-center">
            <h6 className="adada-mobile-section-title mb-3">Follow Us</h6>

            <div className="d-flex justify-content-center gap-3">
              {contactInfo.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="adada-social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCartDrawer && (
        <div className="adada-cart-backdrop" onClick={closeCartDrawer}></div>
      )}

      <div className={`adada-cart-drawer ${showCartDrawer ? "show" : ""}`}>
        <div className="adada-cart-header">
          <h5 className="mb-0">My Cart ({cartCount})</h5>
          <button
            type="button"
            className="adada-cart-close"
            onClick={closeCartDrawer}
          >
            <FaTimes />
          </button>
        </div>

        <div className="adada-cart-body">
          {cartItems.length === 0 ? (
            <div className="adada-cart-empty">Your cart is empty.</div>
          ) : (
            cartItems.map((item) => {
              const hasDiscount = item.discount && parseFloat(item.discount) > 0;
              const originalPrice = parseFloat(item.price);
              const discountPercent = hasDiscount ? parseFloat(item.discount) : 0;
              const displayPrice = getDisplayPrice(item);
              
              return (
                <div className="adada-cart-item" key={item.id}>
                  <div className="adada-cart-item-image">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="img-fluid"
                    />
                  </div>

                  <div className="adada-cart-item-content">
                    <h6 className="adada-cart-item-title">{item.title}</h6>
                    <div
                      className="adada-cart-item-desc"
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const temp = document.createElement("div");
                          temp.innerHTML = item.description || "";
                          const plainText = temp.textContent || temp.innerText || "";
                          if (plainText.length > 40) {
                            return plainText.substring(0, 40) + "...";
                          }
                          return plainText;
                        })(),
                      }}
                    />
                    <div className="adada-cart-item-price">
                      {hasDiscount ? (
                        <>
                          <span className="original-price">
                            ${originalPrice.toFixed(2)}
                          </span>
                          <span className="discounted-price">
                            ${displayPrice.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span>${displayPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div className="adada-cart-item-actions">
                    <div className="adada-qty-box">
                      <button type="button" onClick={() => decreaseQty(item.id)}>
                        <FaMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => increaseQty(item.id)}>
                        <FaPlus />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="adada-cart-delete"
                      onClick={() => removeCartItem(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="adada-cart-footer">
          <div className="adada-cart-subtotal">
            <span>SUB TOTAL :</span>
            <strong>${subTotal.toFixed(2)}</strong>
          </div>

          <div className="adada-cart-footer-btns">
            <button
              type="button"
              className="adada-cart-action-btn"
              onClick={() => {
                closeCartDrawer();
                navigate("/shop");
              }}
            >
              CONTINUE SHOPPING
            </button>

            <button
              type="button"
              className="adada-cart-action-btn"
              onClick={() => {
                closeCartDrawer();
                navigate("/checkout");
              }}
            >
              CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;