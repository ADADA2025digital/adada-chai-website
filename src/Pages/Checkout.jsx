import React, { useMemo, useState } from "react";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import Banner from "../Components/Banner";
import bannerBg from "../assets/images/about-banner.png";
import cupOutlineLeft from "../assets/images/browncup.png";
import cupOutlineRight from "../assets/images/browncinamon.png";
import c1 from "../assets/images/p1.png";
import c2 from "../assets/images/p1.png";
import c3 from "../assets/images/p1.png";
import smicon from "../assets/images/smicon.png";

const Checkout = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethod: "paypal",
  });

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "1 FLAVOUR CHAI MACHINE",
      image: c1,
      price: 100,
      quantity: 1,
    },
    {
      id: 2,
      title: "2 FLAVOUR CHAI MACHINE",
      image: c2,
      price: 100,
      quantity: 1,
    },
    {
      id: 3,
      title: "3 FLAVOUR CHAI MACHINE",
      image: c3,
      price: 100,
      quantity: 1,
    },
  ]);

  const subTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };

  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const removeCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    console.log("Order Data:", {
      customer: formData,
      cartItems,
      subTotal,
      totalItems,
    });

    if (formData.paymentMethod === "paypal") {
      console.log("Proceed to PayPal");
    }

    if (formData.paymentMethod === "stripe") {
      console.log("Proceed to Stripe");
    }
  };

  return (
    <>
      <Banner
        title="CHECKOUT"
        subtitle="Tea first. Everything else later."
        breadcrumb="HOME > CHECKOUT"
        bgImage={bannerBg}
      />

      <section className="checkout-section position-relative">
        <img
          src={cupOutlineLeft}
          alt="Cup Outline"
          className="checkout-decor checkout-decor-left img-fluid"
        />

        <img
          src={cupOutlineRight}
          alt="Cinnamon Decor"
          className="checkout-decor checkout-decor-right img-fluid"
        />

        <div className="container position-relative">
          <motion.div
            className="text-center mb-4 mb-lg-5"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img
              src={smicon}
              alt="Icon"
              className="about-page-topicon-img checkout-top-icon"
            />
          </motion.div>

          <form onSubmit={handlePlaceOrder}>
            <div className="row g-4 align-items-stretch">
              <div className="col-12 col-lg-6 d-flex">
                <motion.div
                  className="checkout-card w-100 d-flex flex-column"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.85, ease: "easeOut" }}
                >
                  <div className="checkout-badge">User Details</div>

                  <div className="checkout-scroll-area pe-0 pe-md-2">
                    <div className="mb-3">
                      <label className="checkout-label">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-control checkout-input"
                        placeholder="ex: Roja"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="checkout-label">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-control checkout-input"
                        placeholder="ex: Kumar"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="checkout-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control checkout-input"
                        placeholder="ex: roja123@gmail.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="checkout-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control checkout-input"
                        placeholder="ex: 12345678"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="checkout-divider"></div>

                    <div className="pb-2">
                      <div className="checkout-badge mb-3">Address</div>

                      <div className="mb-3">
                        <label className="checkout-label">Street Address</label>
                        <textarea
                          name="addressLine"
                          rows="3"
                          className="form-control checkout-input checkout-textarea"
                          placeholder="Enter your street address"
                          value={formData.addressLine}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="row g-3">
                        <div className="col-12 col-sm-6">
                          <label className="checkout-label">City</label>
                          <input
                            type="text"
                            name="city"
                            className="form-control checkout-input"
                            placeholder="Enter city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="col-12 col-sm-6">
                          <label className="checkout-label">State</label>
                          <input
                            type="text"
                            name="state"
                            className="form-control checkout-input"
                            placeholder="Enter state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="checkout-label">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          className="form-control checkout-input"
                          placeholder="Enter postal code"
                          value={formData.postalCode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="checkout-divider"></div>

                    <div className="pb-2">
                      <div className="checkout-badge mb-3">Payment Option</div>

                      <div className="d-flex flex-column gap-2">
                        <label className="checkout-radio">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={formData.paymentMethod === "paypal"}
                            onChange={handleChange}
                          />
                          <span>PayPal</span>
                        </label>

                        <label className="checkout-radio">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="stripe"
                            checked={formData.paymentMethod === "stripe"}
                            onChange={handleChange}
                          />
                          <span>Stripe</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="col-12 col-lg-6 d-flex">
                <motion.div
                  className="checkout-card w-100 d-flex flex-column"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.9, delay: 0.12, ease: "easeOut" }}
                >
                  <div className="checkout-badge">Order Details</div>

                  <div className="checkout-order-items pe-0 pe-md-2">
                    {cartItems.length === 0 ? (
                      <div className="checkout-empty-cart">Your cart is empty.</div>
                    ) : (
                      cartItems.map((item, index) => (
                        <motion.div
                          className={`checkout-order-item ${
                            index !== cartItems.length - 1 ? "with-border" : ""
                          }`}
                          key={item.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.1 }}
                          transition={{
                            duration: 0.6,
                            delay: index * 0.08,
                            ease: "easeOut",
                          }}
                        >
                          <div className="checkout-order-left">
                            <div className="checkout-order-image">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="img-fluid"
                              />
                            </div>

                            <div className="checkout-order-info">
                              <h6 className="checkout-product-title mb-2">
                                {item.title}
                              </h6>

                              <div className="checkout-qty-box">
                                <button
                                  type="button"
                                  onClick={() => decreaseQty(item.id)}
                                >
                                  <FaMinus />
                                </button>
                                <span>
                                  {String(item.quantity).padStart(2, "0")}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => increaseQty(item.id)}
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="checkout-order-right">
                            <div className="checkout-item-price">
                              ${item.price.toFixed(2)}
                            </div>

                            <button
                              type="button"
                              className="checkout-delete-btn"
                              onClick={() => removeCartItem(item.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="checkout-footer">
                    <div className="checkout-subtotal">
                      <span>SUB TOTAL ({totalItems} items):</span>
                      <strong>${subTotal.toFixed(2)}</strong>
                    </div>

                    <div className="checkout-btn-group">
                      <button type="submit" className="checkout-btn primary-btn">
                        Place Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;