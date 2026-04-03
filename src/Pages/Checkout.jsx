import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaTimes,
  FaDownload,
  FaEye,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import Banner from "../Components/Banner";
import bannerBg from "../assets/images/about-banner.png";
import cupOutlineLeft from "../assets/images/browncup.png";
import cupOutlineRight from "../assets/images/browncinamon.png";
import smicon from "../assets/images/smicon.png";
import { orderAPI } from "../Config/route";
import ReCAPTCHA from "react-google-recaptcha";

const DEFAULT_COUNTRY = "Sri Lanka";

const stripePromise = loadStripe(
  "pk_test_51T6ky36nDiic8XlH4wGGMNX2VgNqrXqMBCBx5G0YNwWmCs5MVUkLCCpGitUZcWm35JQ8YcSa2PYzr1lEezzZxuPC00KDmlUv6J",
);

const normalizeDeliveryType = (title = "") => {
  const lower = title.toLowerCase();
  if (lower.includes("express")) return "express";
  return "standard";
};

const parseWeightValueToKg = (value = "") => {
  const clean = value.toLowerCase().trim();

  if (clean.endsWith("kg")) {
    const num = parseFloat(clean.replace("kg", "").trim());
    return Number.isNaN(num) ? null : num;
  }

  if (clean.endsWith("g")) {
    const num = parseFloat(clean.replace("g", "").trim());
    return Number.isNaN(num) ? null : num / 1000;
  }

  const fallback = parseFloat(clean);
  return Number.isNaN(fallback) ? null : fallback;
};

const parseWeightRangeFromTitle = (title = "") => {
  const match = title.match(/\((.*?)\)/);
  if (!match) return null;

  const rangeText = match[1].trim();
  const parts = rangeText.split("-").map((p) => p.trim());

  if (parts.length !== 2) return null;

  const minWeight = parseWeightValueToKg(parts[0]);
  const maxWeight = parseWeightValueToKg(parts[1]);

  if (minWeight === null || maxWeight === null) return null;

  return { minWeight, maxWeight };
};

const fetchDeliveryOptions = async () => {
  try {
    const response = await fetch(
      "https://urbanviewre.com/chai-backend/api/delivery-options",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch delivery options");
    }

    const result = await response.json();

    if (result.status === "success" && Array.isArray(result.data)) {
      const grouped = {};

      result.data.forEach((option) => {
        const title = option.delivery_title || "";
        const range = parseWeightRangeFromTitle(title);
        const deliveryType = normalizeDeliveryType(title);

        if (!range) return;

        const optionData = {
          option_id: option.option_id,
          title,
          price: parseFloat(option.delivery_price || 0),
          description: option.deleivery_description || "",
          minWeight: range.minWeight,
          maxWeight: range.maxWeight,
          deliveryType,
          created_at: option.created_at,
          updated_at: option.updated_at,
        };

        if (!grouped[deliveryType]) {
          grouped[deliveryType] = [];
        }

        grouped[deliveryType].push(optionData);
      });

      Object.keys(grouped).forEach((type) => {
        grouped[type] = grouped[type].sort(
          (a, b) => a.minWeight - b.minWeight,
        );
      });

      return grouped;
    }

    return {};
  } catch (error) {
    console.error("Error fetching delivery options:", error);
    return {};
  }
};

const calculateDeliveryCharge = (
  totalWeightKg,
  selectedDeliveryType,
  deliveryOptions,
) => {
  if (!totalWeightKg || totalWeightKg <= 0) return 0;
  if (!deliveryOptions || typeof deliveryOptions !== "object") return 0;

  const options = deliveryOptions[selectedDeliveryType] || [];
  if (!options.length) return 0;

  const applicableOption = options.find((option) => {
    const isLastTier = option === options[options.length - 1];

    if (isLastTier) {
      return totalWeightKg >= option.minWeight && totalWeightKg <= option.maxWeight;
    }

    return totalWeightKg >= option.minWeight && totalWeightKg < option.maxWeight;
  });

  if (applicableOption) {
    return Number(applicableOption.price) || 0;
  }

  const lastTier = options[options.length - 1];

  if (lastTier && totalWeightKg > lastTier.maxWeight) {
    return Number(lastTier.price) || 0;
  }

  return 0;
};

const SuccessModal = ({ isOpen, onClose, orderResult }) => {
  const [viewLoading, setViewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const orderData = orderResult?.data;
  const transaction = orderData?.transaction;
  const items = orderData?.items || [];

  const totalAmount = items
    .reduce((sum, item) => {
      return sum + item.quantity * parseFloat(item.order_price);
    }, 0)
    .toFixed(2);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const extractToken = (url) => {
    if (!url) return null;
    const match = url.match(/\/api\/invoices\/(view|download)\/([^/?]+)/);
    return match ? match[2] : null;
  };

  const getMaskedUrl = (token, type) => {
    const frontendUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${frontendUrl}/invoice/${type}/${token}`;
  };

  const handleViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!transaction?.view_url) return;

    setViewLoading(true);
    setError(null);

    const token = extractToken(transaction.view_url);

    if (!token) {
      setError("Invalid invoice URL");
      setViewLoading(false);
      return;
    }

    const maskedUrl = getMaskedUrl(token, "view");
    const newWindow = window.open(maskedUrl, "_blank", "noopener,noreferrer");

    if (!newWindow) {
      setViewLoading(false);
    } else {
      setTimeout(() => setViewLoading(false), 1200);
    }
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!transaction?.download_url) return;

    setDownloadLoading(true);
    setError(null);

    try {
      const token = extractToken(transaction.download_url);
      if (!token) throw new Error("Invalid invoice URL");

      const response = await fetch(transaction.download_url);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `invoice_${orderData?.order_number || "download"}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
        );
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download invoice. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose(e);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 9999 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="success-modal"
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 30 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            style={{ position: "relative", zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="success-modal-scroll">
              <button
                className="modal-close-btn"
                onClick={handleClose}
                style={{ cursor: "pointer" }}
                type="button"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>

              <div className="modal-header d-flex flex-column text-center">
                <img
                  src={smicon}
                  alt="Icon"
                  className="about-page-topicon-img checkout-top-icon"
                />
                <h2 className="modal-title">Order Confirmed!</h2>
                <p className="modal-subtitle">Thank you for your purchase</p>
              </div>

              <div className="modal-body">
                {error && (
                  <div
                    className="alert alert-danger alert-dismissible fade show mb-3"
                    role="alert"
                  >
                    <strong>Error:</strong> {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                )}

                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="order-summary">
                      <div className="summary-row">
                        <span className="summary-label">Order Number:</span>
                        <span className="summary-value highlight">
                          {orderData?.order_number}
                        </span>
                      </div>

                      <div className="summary-row">
                        <span className="summary-label">Date:</span>
                        <span className="summary-value">
                          {orderData?.order_date
                            ? new Date(orderData.order_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "N/A"}
                        </span>
                      </div>

                      <div className="summary-row">
                        <span className="summary-label">Items:</span>
                        <span className="summary-value">
                          {itemCount} item(s)
                        </span>
                      </div>

                      <div className="summary-row">
                        <span className="summary-label">Total Amount:</span>
                        <span className="summary-value price">
                          ${totalAmount}
                        </span>
                      </div>

                      <div className="summary-row">
                        <span className="summary-label">Payment Status:</span>
                        <span className="summary-value status paid">
                          {orderData?.payment_status || "Paid"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="customer-info">
                      <h4 className="info-title">Customer Details</h4>

                      <div className="info-row">
                        <span className="info-label">Name:</span>
                        <span className="info-value">
                          {orderData?.customer?.full_name}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">
                          {orderData?.customer?.email}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Phone:</span>
                        <span className="info-value">
                          {orderData?.customer?.ph_number}
                        </span>
                      </div>

                      <div className="info-row">
                        <span className="info-label">Address:</span>
                        <span className="info-value">
                          {orderData?.address?.address_line1 ||
                            orderData?.address?.street_name ||
                            "N/A"}
                          {orderData?.address?.city
                            ? `, ${orderData.address.city}`
                            : ""}
                          {orderData?.address?.state
                            ? `, ${orderData.address.state}`
                            : ""}
                          {orderData?.address?.postal_code
                            ? ` ${orderData.address.postal_code}`
                            : ""}
                          {orderData?.address?.country
                            ? `, ${orderData.address.country}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="ordered-items">
                    <h4 className="info-title">Ordered Items</h4>

                    <div className="ordered-items-scroll">
                      {items.map((item, index) => (
                        <div key={index} className="ordered-item">
                          <div className="item-info">
                            <span className="item-name">
                              {item.product?.product_name || "Product"}
                            </span>
                            <span className="item-details">
                              {item.quantity} × ${parseFloat(item.order_price).toFixed(2)}
                            </span>
                          </div>

                          <div className="item-total">
                            ${(item.quantity * parseFloat(item.order_price)).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="invoice-actions">
                  <div className="action-buttons">
                    {transaction?.view_url && (
                      <a
                        href="#"
                        onClick={handleViewClick}
                        className="modal-btn modal-btn-outline"
                        style={{
                          cursor: viewLoading ? "wait" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          opacity: viewLoading ? 0.6 : 1,
                        }}
                      >
                        {viewLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Loading...
                          </>
                        ) : (
                          <>
                            <FaEye className="btn-icon" />
                            View Invoice
                          </>
                        )}
                      </a>
                    )}

                    {transaction?.download_url && (
                      <a
                        href="#"
                        onClick={handleDownloadClick}
                        className="modal-btn modal-btn-primary"
                        style={{
                          cursor: downloadLoading ? "wait" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          opacity: downloadLoading ? 0.6 : 1,
                        }}
                      >
                        {downloadLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <FaDownload className="btn-icon" />
                            Download PDF
                          </>
                        )}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const PaymentForm = forwardRef(
  (
    {
      formData,
      cartItems,
      subTotal,
      totalItems,
      totalWeight,
      deliveryCharge,
      selectedDeliveryType,
      onDeliveryTypeChange,
      onSuccess,
      onError,
      loading,
      setLoading,
      addressInputRef,
      autocompleteRef,
      addressError,
      validateAddress,
    },
    ref,
  ) => {
    const stripe = useStripe();
    const elements = useElements();
    const recaptchaRef = useRef(null);
    const cardElementRef = useRef(null);

    const [cardError, setCardError] = useState("");
    const [processingPayment, setProcessingPayment] = useState(false);
    const [showRecaptcha, setShowRecaptcha] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaError, setCaptchaError] = useState("");

    useImperativeHandle(ref, () => ({
      resetForm: () => {
        if (elements) {
          const cardElement = elements.getElement(CardElement);
          if (cardElement) {
            cardElement.clear();
          }
        }
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setCaptchaToken("");
        setCaptchaError("");
        setShowRecaptcha(false);
        setCardError("");
        setProcessingPayment(false);
      },
    }));

    const handleCardChange = (event) => {
      if (event.error) {
        setCardError(event.error.message);
      } else {
        setCardError("");
      }
    };

    const handleCaptchaChange = (token) => {
      setCaptchaToken(token || "");
      setCaptchaError("");
    };

    const processOrder = async () => {
      if (!stripe || !elements) {
        onError("Stripe is not initialized. Please refresh the page.");
        return;
      }

      const cardElement = elements.getElement(CardElement);

      setProcessingPayment(true);
      setLoading(true);

      try {
        if (cartItems.length === 0) {
          throw new Error("Your cart is empty");
        }

        const calculatedTotal = cartItems.reduce((sum, item) => {
          const originalPrice = Number(item.price) || 0;
          const discountPercent = Number(item.discount) || 0;
          const finalPrice =
            discountPercent > 0
              ? originalPrice * (1 - discountPercent / 100)
              : originalPrice;

          return sum + finalPrice * (Number(item.quantity) || 1);
        }, 0);

        if (calculatedTotal <= 0) {
          throw new Error("Invalid total amount. Please check your cart items.");
        }

        if (
          !formData.firstName ||
          !formData.lastName ||
          !formData.email ||
          !formData.phone
        ) {
          throw new Error("Please fill in all required fields");
        }

        if (!validateAddress()) {
          throw new Error("Please enter a complete address");
        }

        if (!captchaToken) {
          setCaptchaError(
            "Please verify the reCAPTCHA before placing your order.",
          );
          setShowRecaptcha(true);
          throw new Error("Please complete the reCAPTCHA verification.");
        }

        const { token, error } = await stripe.createToken(cardElement, {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        });

        if (error) throw new Error(error.message);
        if (!token?.id) throw new Error("Failed to create payment token");

        const invalidItems = cartItems.filter(
          (item) => !item.id || !item.price || !item.quantity,
        );

        if (invalidItems.length > 0) {
          throw new Error(
            "Some items in your cart are invalid. Please remove them and try again.",
          );
        }

        const fullAddress = addressInputRef.current?.value?.trim() || "";

        const orderData = {
          email: formData.email,
          full_name: `${formData.firstName} ${formData.lastName}`.trim(),
          ph_number: formData.phone,
          street_no: formData.streetNo,
          street_name: formData.streetName,
          suburb: formData.suburb,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
          address_line1: fullAddress || formData.streetName,
          city: formData.suburb,
          delivery_charge: deliveryCharge,
          delivery_type: selectedDeliveryType,
          total_weight: totalWeight,
          products: cartItems.map((item) => {
            const originalPrice = Number(item.price) || 0;
            const discountPercent = Number(item.discount) || 0;
            const finalPrice =
              discountPercent > 0
                ? originalPrice * (1 - discountPercent / 100)
                : originalPrice;

            return {
              product_id: parseInt(item.id, 10),
              quantity: parseInt(item.quantity, 10) || 1,
              price: finalPrice,
              original_price: originalPrice,
              discount_percent: discountPercent,
              discount_name: item.discount_name || null,
              weight: item.weight || 0,
            };
          }),
          card_number: token.id,
          exp_month: 12,
          exp_year: new Date().getFullYear() + 1,
          cvc: "123",
          recaptchaToken: captchaToken,
        };

        const result = await orderAPI.placeGuestOrder(orderData);

        if (result?.status === "success") {
          if (recaptchaRef.current) {
            recaptchaRef.current.reset();
          }
          if (cardElement) {
            cardElement.clear();
          }
          setCaptchaToken("");
          setCaptchaError("");
          setShowRecaptcha(false);
          setCardError("");
          onSuccess(result);
        } else {
          throw new Error(result?.message || "Failed to process order");
        }
      } catch (err) {
        if (err.response) {
          if (err.response.status === 422) {
            const validationErrors =
              err.response.data.errors || err.response.data;
            let errorMessage = "Validation failed: ";

            if (typeof validationErrors === "object") {
              const errorList = [];
              Object.values(validationErrors).forEach((errors) => {
                if (Array.isArray(errors)) errorList.push(...errors);
                else if (typeof errors === "string") errorList.push(errors);
                else errorList.push(JSON.stringify(errors));
              });
              errorMessage += errorList.join(", ");
            } else if (typeof validationErrors === "string") {
              errorMessage = validationErrors;
            } else {
              errorMessage = "Please check all required fields.";
            }

            onError(errorMessage);
          } else if (err.response.data?.message) {
            onError(err.response.data.message);
          } else {
            onError("Failed to place order. Please try again.");
          }
        } else if (err.request) {
          onError("Network error. Please check your connection and try again.");
        } else if (err.message) {
          onError(err.message);
        } else {
          onError(
            "Failed to place order. Please check your details and try again.",
          );
        }
      } finally {
        setProcessingPayment(false);
        setLoading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!captchaToken) {
        setShowRecaptcha(true);
        setCaptchaError(
          "Please verify the reCAPTCHA before placing your order.",
        );
        return;
      }
      await processOrder();
    };

    const discountSummary = useMemo(() => {
      const totalOriginal = cartItems.reduce((sum, item) => {
        return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
      }, 0);

      const totalDiscount = cartItems.reduce((sum, item) => {
        const originalPrice = Number(item.price) || 0;
        const discountPercent = Number(item.discount) || 0;
        const quantity = Number(item.quantity) || 1;

        const discountAmount =
          discountPercent > 0
            ? originalPrice * (discountPercent / 100) * quantity
            : 0;

        return sum + discountAmount;
      }, 0);

      return { totalOriginal, totalDiscount, finalTotal: subTotal };
    }, [cartItems, subTotal]);

    const grandTotal = subTotal + deliveryCharge;

    return (
      <form onSubmit={handleSubmit}>
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
                  <label className="checkout-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control checkout-input"
                    placeholder="ex: Roja"
                    value={formData.firstName}
                    onChange={formData.handleChange}
                    required
                    disabled={loading || processingPayment}
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control checkout-input"
                    placeholder="ex: Kumar"
                    value={formData.lastName}
                    onChange={formData.handleChange}
                    required
                    disabled={loading || processingPayment}
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control checkout-input"
                    placeholder="ex: roja123@gmail.com"
                    value={formData.email}
                    onChange={formData.handleChange}
                    required
                    disabled={loading || processingPayment}
                  />
                </div>

                <div className="mb-3">
                  <label className="checkout-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control checkout-input"
                    placeholder="ex: 12345678"
                    value={formData.phone}
                    onChange={formData.handleChange}
                    required
                    disabled={loading || processingPayment}
                  />
                </div>

                <div className="checkout-divider"></div>

                <div className="pb-2">
                  <div className="checkout-badge mb-3">Address</div>

                  {addressError && (
                    <div className="alert alert-warning mb-3">
                      {addressError}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="checkout-label">Address *</label>
                    <input
                      ref={addressInputRef}
                      type="text"
                      className="form-control checkout-input"
                      placeholder="Enter your full address"
                      onChange={() => {
                        if (!autocompleteRef.current) {
                          formData.handleAddressManualReset();
                        }
                      }}
                      required
                      disabled={loading || processingPayment}
                      autoComplete="off"
                    />
                  </div>

                  <input
                    type="hidden"
                    name="streetNo"
                    value={formData.streetNo}
                  />
                  <input
                    type="hidden"
                    name="streetName"
                    value={formData.streetName}
                  />
                  <input type="hidden" name="suburb" value={formData.suburb} />
                  <input type="hidden" name="state" value={formData.state} />
                  <input
                    type="hidden"
                    name="postalCode"
                    value={formData.postalCode}
                  />
                  <input
                    type="hidden"
                    name="country"
                    value={formData.country}
                  />
                </div>

                <div className="checkout-divider"></div>

                <div className="pb-2">
                  <div className="checkout-badge mb-3">Payment Details</div>

                  <div className="mb-3">
                    <label className="checkout-label">Card Information *</label>
                    <div className="stripe-card-element-wrapper">
                      <CardElement
                        ref={cardElementRef}
                        onChange={handleCardChange}
                        onFocus={() => setShowRecaptcha(true)}
                      />
                    </div>
                    {cardError && (
                      <div className="text-danger mt-2 small">{cardError}</div>
                    )}
                  </div>

                  {showRecaptcha && (
                    <div className="mb-3">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6LfTOPoqAAAAALiP94ZP6TEYP5XiTsKjvr7dpYh9"
                        onChange={handleCaptchaChange}
                      />
                      {captchaError && (
                        <div className="text-danger mt-2 small">
                          {captchaError}
                        </div>
                      )}
                    </div>
                  )}
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
                  cartItems.map((item, index) => {
                    const originalPrice = Number(item.price) || 0;
                    const discountPercent = Number(item.discount) || 0;
                    const hasDiscount = discountPercent > 0;

                    const discountedPrice = hasDiscount
                      ? originalPrice * (1 - discountPercent / 100)
                      : originalPrice;

                    const savings = hasDiscount
                      ? originalPrice - discountedPrice
                      : 0;

                    const quantity =
                      Number(item.quantity) > 0 ? Number(item.quantity) : 1;

                    return (
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
                              {item.weight ? ` (${item.weight}kg)` : ""}
                            </h6>

                            {hasDiscount && (
                              <div className="discount-badge mb-2">
                                <span className="discount-percent">
                                  {discountPercent}% OFF
                                </span>
                                <span className="discount-label">
                                  {item.discount_name || "Discount"}
                                </span>
                              </div>
                            )}

                            <div className="checkout-qty-box">
                              <button
                                type="button"
                                onClick={() => formData.decreaseQty(item.id)}
                                disabled={loading || processingPayment}
                              >
                                <FaMinus />
                              </button>

                              <span>{String(quantity).padStart(2, "0")}</span>

                              <button
                                type="button"
                                onClick={() => formData.increaseQty(item.id)}
                                disabled={loading || processingPayment}
                              >
                                <FaPlus />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="checkout-order-right">
                          <div className="checkout-item-price d-flex gap-2">
                            {hasDiscount ? (
                              <>
                                {savings > 0 && (
                                  <span className="savings-amount">
                                    Save ${savings.toFixed(2)}
                                  </span>
                                )}

                                <span className="original-price text-muted text-decoration-line-through">
                                  ${originalPrice.toFixed(2)}
                                </span>

                                <span className="discounted-price">
                                  ${discountedPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="regular-price">
                                ${originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="checkout-delete-btn"
                            onClick={() => formData.removeCartItem(item.id)}
                            disabled={loading || processingPayment}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              <div className="delivery-options-section">
                <div className="delivery-weight-info mb-3">
                  <span>
                    Total Package Weight:{" "}
                    <strong>{totalWeight.toFixed(2)} kg</strong>
                  </span>
                </div>
              </div>

              <div className="checkout-footer">
                <div className="checkout-subtotal">
                  <span>SUB TOTAL ({totalItems} items):</span>
                  <strong>${subTotal.toFixed(2)}</strong>
                </div>

                <div className="checkout-delivery-charge">
                  <span>DELIVERY CHARGE:</span>
                  <strong>${deliveryCharge.toFixed(2)}</strong>
                </div>

                <div className="checkout-grand-total">
                  <span>TOTAL:</span>
                  <strong>${(subTotal + deliveryCharge).toFixed(2)}</strong>
                </div>

                <div className="checkout-btn-group">
                  <button
                    type="submit"
                    className="checkout-btn primary-btn"
                    disabled={
                      loading ||
                      processingPayment ||
                      cartItems.length === 0 ||
                      !stripe
                    }
                  >
                    {processingPayment ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Processing Payment...
                      </>
                    ) : loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Placing Order...
                      </>
                    ) : (
                      `Place Order • $${(subTotal + deliveryCharge).toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    );
  },
);

const Checkout = () => {
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const paymentFormResetRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetNo: "",
    streetName: "",
    suburb: "",
    state: "",
    postalCode: "",
    country: DEFAULT_COUNTRY,
    paymentMethod: "stripe",
  });

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [selectedDeliveryType, setSelectedDeliveryType] = useState("standard");
  const [deliveryOptions, setDeliveryOptions] = useState({});
  const [deliveryOptionsLoading, setDeliveryOptionsLoading] = useState(false);

  const totalWeight = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const itemWeight = Number(item.weight) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + itemWeight * qty;
    }, 0);
  }, [cartItems]);

  const deliveryCharge = useMemo(() => {
    return calculateDeliveryCharge(
      totalWeight,
      selectedDeliveryType,
      deliveryOptions,
    );
  }, [totalWeight, selectedDeliveryType, deliveryOptions]);

  useEffect(() => {
    loadCartFromStorage();
    fetchDeliveryOptionsFromAPI();

    const handleCartUpdated = () => {
      loadCartFromStorage();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const fetchDeliveryOptionsFromAPI = async () => {
    try {
      setDeliveryOptionsLoading(true);
      const options = await fetchDeliveryOptions();
      setDeliveryOptions(options || {});

      const availableTypes = Object.keys(options || {});
      if (availableTypes.length > 0) {
        if (!availableTypes.includes(selectedDeliveryType)) {
          setSelectedDeliveryType(availableTypes[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load delivery options:", err);
    } finally {
      setDeliveryOptionsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initGoogleAutocomplete = async () => {
      try {
        if (!addressInputRef.current) return;
        if (autocompleteRef.current) return;

        setOptions({
          key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
          version: "weekly",
        });

        const placesLibrary = await importLibrary("places");
        if (!isMounted) return;

        const AutocompleteClass =
          placesLibrary.Autocomplete ||
          window.google?.maps?.places?.Autocomplete;

        if (!AutocompleteClass) {
          throw new Error("Autocomplete class not found");
        }

        autocompleteRef.current = new AutocompleteClass(
          addressInputRef.current,
          {
            types: ["address"],
            fields: [
              "address_components",
              "formatted_address",
              "geometry",
              "name",
            ],
            componentRestrictions: { country: "au" },
          },
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          handlePlaceSelect(place);
        });

        setAddressError("");
      } catch (err) {
        console.error("[Autocomplete Debug] Google autocomplete failed:", err);
        setAddressError(
          "Address autocomplete is unavailable. Please enter your address manually.",
        );
      }
    };

    initGoogleAutocomplete();

    return () => {
      isMounted = false;
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!showModal) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [showModal]);

  const loadCartFromStorage = () => {
    const storedCart = JSON.parse(localStorage.getItem("adadaCart")) || [];

    const processedCart = storedCart.map((item) => {
      let discountPercent = 0;
      let discountName = null;

      if (
        item.discount &&
        typeof item.discount === "object" &&
        item.discount.discount_percentage
      ) {
        discountPercent = parseFloat(item.discount.discount_percentage);
        discountName = item.discount.discount_name;
      } else if (item.discount && typeof item.discount === "number") {
        discountPercent = item.discount;
        discountName = item.discount_name;
      }

      const originalPrice = parseFloat(item.sell_price || item.price || 0);
      const finalPrice =
        discountPercent > 0
          ? originalPrice * (1 - discountPercent / 100)
          : originalPrice;

      let itemWeightKg = 0.25;

      if (item.dimensions && item.dimensions.weight !== undefined && item.dimensions.weight !== null) {
        itemWeightKg = parseFloat(item.dimensions.weight);
      } else if (item.weight !== undefined && item.weight !== null) {
        itemWeightKg = parseFloat(item.weight);
      }

      if (Number.isNaN(itemWeightKg) || itemWeightKg < 0) {
        itemWeightKg = 0.25;
      }

      return {
        id: item.id,
        title: item.title || item.product_name,
        price: originalPrice,
        discount: discountPercent,
        discount_name: discountName,
        finalPrice,
        image: item.image,
        description: item.description || "",
        quantity: parseInt(item.quantity, 10) || 1,
        weight: itemWeightKg,
      };
    });

    setCartItems(processedCart);
  };

  const updateCartAndStorage = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("adadaCart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const originalPrice = parseFloat(item.price || 0);
      const discountPercent = item.discount ? parseFloat(item.discount) : 0;
      const finalPrice =
        discountPercent > 0
          ? originalPrice * (1 - discountPercent / 100)
          : originalPrice;
      return sum + finalPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressManualReset = () => {
    setFormData((prev) => ({
      ...prev,
      streetNo: "",
      streetName: "",
      suburb: "",
      state: "",
      postalCode: "",
    }));
  };

  const handlePlaceSelect = (place) => {
    try {
      if (!place?.address_components) return;

      const getComponent = (type) => {
        const component = place.address_components.find((c) =>
          c.types.includes(type),
        );
        return component ? component.long_name : "";
      };

      const streetNumber = getComponent("street_number");
      const route = getComponent("route");
      const suburb =
        getComponent("locality") ||
        getComponent("sublocality") ||
        getComponent("sublocality_level_1");
      const state = getComponent("administrative_area_level_1");
      const postalCode = getComponent("postal_code");
      const country = getComponent("country");

      const fullStreetName =
        streetNumber && route
          ? `${streetNumber} ${route}`
          : route || streetNumber || "";

      setFormData((prev) => ({
        ...prev,
        streetNo: streetNumber,
        streetName: fullStreetName,
        suburb,
        state,
        country: country || DEFAULT_COUNTRY,
        postalCode,
      }));

      setAddressError("");
    } catch (err) {
      console.error("Error in handlePlaceSelect:", err);
    }
  };

  const validateAddress = () => {
    try {
      if (
        formData.streetName &&
        formData.suburb &&
        formData.state &&
        formData.postalCode
      ) {
        return true;
      }

      const manualAddress = addressInputRef.current?.value?.trim();

      if (manualAddress && manualAddress.length > 5) {
        const addressParts = manualAddress
          .split(",")
          .map((part) => part.trim());

        if (addressParts.length >= 3) {
          const stateAndPostcode = addressParts[addressParts.length - 1]
            ?.trim()
            ?.split(/\s+/);
          const derivedState = stateAndPostcode?.[0] || "";
          const derivedPostcode = stateAndPostcode?.[1] || "";

          setFormData((prev) => ({
            ...prev,
            streetNo: prev.streetNo || "",
            streetName: prev.streetName || addressParts[0] || "",
            suburb: prev.suburb || addressParts[1] || "",
            state: prev.state || derivedState,
            postalCode: prev.postalCode || derivedPostcode,
            country: prev.country || DEFAULT_COUNTRY,
          }));

          return true;
        }
      }

      return false;
    } catch (err) {
      console.error("validateAddress error:", err);
      return false;
    }
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

  const handleDeliveryTypeChange = (type) => {
    setSelectedDeliveryType(type);
  };

  const handleOrderSuccess = (result) => {
    setOrderResult(result);
    localStorage.removeItem("adadaCart");
    setCartItems([]);
    window.dispatchEvent(new Event("cartUpdated"));

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      streetNo: "",
      streetName: "",
      suburb: "",
      state: "",
      postalCode: "",
      country: DEFAULT_COUNTRY,
      paymentMethod: "stripe",
    });

    if (addressInputRef.current) {
      addressInputRef.current.value = "";
    }

    if (paymentFormResetRef.current) {
      paymentFormResetRef.current.resetForm();
    }

    setTimeout(() => {
      setShowModal(true);
    }, 100);

    setSuccess("Order placed successfully!");
    setError(null);
  };

  const handleOrderError = (errorMessage) => {
    setError(errorMessage);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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

          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show mb-4"
              role="alert"
            >
              <strong>Error:</strong> {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {success && (
            <div
              className="alert alert-success alert-dismissible fade show mb-4"
              role="alert"
            >
              <strong>Success:</strong> {success}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccess(null)}
              ></button>
            </div>
          )}

          <Elements stripe={stripePromise}>
            <PaymentForm
              ref={paymentFormResetRef}
              formData={{
                ...formData,
                handleChange,
                decreaseQty,
                increaseQty,
                removeCartItem,
                handleAddressManualReset,
              }}
              cartItems={cartItems}
              subTotal={subTotal}
              totalItems={totalItems}
              totalWeight={totalWeight}
              deliveryCharge={deliveryCharge}
              selectedDeliveryType={selectedDeliveryType}
              onDeliveryTypeChange={handleDeliveryTypeChange}
              onSuccess={handleOrderSuccess}
              onError={handleOrderError}
              loading={loading}
              setLoading={setLoading}
              addressInputRef={addressInputRef}
              autocompleteRef={autocompleteRef}
              addressError={addressError}
              validateAddress={validateAddress}
            />
          </Elements>
        </div>
      </section>

      <SuccessModal
        isOpen={showModal}
        onClose={handleCloseModal}
        orderResult={orderResult}
      />
    </>
  );
};

export default Checkout;