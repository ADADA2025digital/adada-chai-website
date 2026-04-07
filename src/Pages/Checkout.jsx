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
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Banner from "../Components/Banner";
import bannerBg from "../assets/images/about-banner.png";
import cupOutlineLeft from "../assets/images/browncup.png";
import cupOutlineRight from "../assets/images/browncinamon.png";
import smicon from "../assets/images/smicon.png";
import { orderAPI, deliveryAPI } from "../Config/route";
import ReCAPTCHA from "react-google-recaptcha";

const DEFAULT_COUNTRY = "Australia";

const stripePromise = loadStripe(
  "pk_test_51T6ky36nDiic8XlH4wGGMNX2VgNqrXqMBCBx5G0YNwWmCs5MVUkLCCpGitUZcWm35JQ8YcSa2PYzr1lEezzZxuPC00KDmlUv6J",
);

// Helper function to parse weight range from delivery title
const parseWeightRange = (title) => {
  if (!title) return null;

  console.log("Parsing title:", title);

  let rangePart = title;
  const parenMatch = title.match(/\(([^)]+)\)/);
  if (parenMatch) {
    rangePart = parenMatch[1];
  }

  const patterns = [
    /(\d+(?:\.\d+)?)\s*(g|kg)?\s*-\s*(\d+(?:\.\d+)?)\s*(g|kg)/i,
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(g|kg)/i,
  ];

  let min, max, minUnit, maxUnit;

  for (const pattern of patterns) {
    const match = rangePart.match(pattern);
    if (match) {
      if (match.length === 5) {
        min = parseFloat(match[1]);
        minUnit = match[2];
        max = parseFloat(match[3]);
        maxUnit = match[4];
      } else if (match.length === 4) {
        min = parseFloat(match[1]);
        max = parseFloat(match[2]);
        maxUnit = match[3];

        if (rangePart.toLowerCase().includes(`${min}kg`)) {
          minUnit = "kg";
        } else if (rangePart.toLowerCase().includes(`${min}g`)) {
          minUnit = "g";
        }
      }
      break;
    }
  }

  if (min === undefined || max === undefined) {
    const numbers = rangePart.match(/(\d+(?:\.\d+)?)/g);
    if (numbers && numbers.length >= 2) {
      min = parseFloat(numbers[0]);
      max = parseFloat(numbers[1]);

      const kgMatch = rangePart.match(/kg/i);
      const gMatch = rangePart.match(/g(?!\w)/i);

      if (kgMatch && !gMatch) {
        maxUnit = "kg";
        if (max < 100) minUnit = "kg";
      } else {
        maxUnit = "g";
      }
    }
  }

  if (min === undefined || max === undefined) {
    console.log("Failed to parse:", title);
    return null;
  }

  let minWeight = min;
  let maxWeight = max;

  if (
    minUnit === "kg" ||
    (minUnit === undefined && min < 100 && rangePart.toLowerCase().includes("kg"))
  ) {
    minWeight = min * 1000;
  }

  if (maxUnit === "kg") {
    maxWeight = max * 1000;
  }

  const result = { minWeight, maxWeight };
  console.log(`Parsed "${title}" -> min: ${minWeight}g, max: ${maxWeight}g`);
  return result;
};

const calculateDeliveryChargeFromAPI = (
  totalWeight,
  deliveryType,
  deliveryOptions,
) => {
  if (!deliveryOptions || deliveryOptions.length === 0) return 0;
  if (totalWeight <= 0) return 0;

  const typeOptions = deliveryOptions.filter((option) =>
    option.delivery_title?.toLowerCase().includes(deliveryType.toLowerCase()),
  );

  if (typeOptions.length === 0) return 0;

  let applicableOption = null;

  for (const option of typeOptions) {
    const range = parseWeightRange(option.delivery_title);
    if (range) {
      const minWeight = range.minWeight;
      const maxWeight = range.maxWeight;

      if (totalWeight >= minWeight && totalWeight <= maxWeight) {
        applicableOption = option;
        break;
      }
    }
  }

  if (!applicableOption && typeOptions.length > 0) {
    let highestMax = 0;
    let highestOption = null;

    for (const option of typeOptions) {
      const range = parseWeightRange(option.delivery_title);
      if (range && range.maxWeight > highestMax) {
        highestMax = range.maxWeight;
        highestOption = option;
      }
    }

    if (highestOption) {
      applicableOption = highestOption;
    } else {
      applicableOption = typeOptions[0];
    }
  }

  return applicableOption
    ? parseFloat(applicableOption.delivery_price || 0)
    : 0;
};

const getAvailableDeliveryOptions = (totalWeight, deliveryOptions) => {
  if (!deliveryOptions || deliveryOptions.length === 0) {
    return { standard: null, express: null };
  }

  console.log("Getting available options for weight:", totalWeight, "g");

  let standardOption = null;
  let expressOption = null;

  for (const option of deliveryOptions) {
    const range = parseWeightRange(option.delivery_title);
    if (range) {
      const minWeight = range.minWeight;
      const maxWeight = range.maxWeight;

      console.log(
        `Checking ${option.delivery_title}: ${minWeight}g - ${maxWeight}g, weight: ${totalWeight}g, match: ${
          totalWeight >= minWeight && totalWeight <= maxWeight
        }`,
      );

      if (totalWeight >= minWeight && totalWeight <= maxWeight) {
        if (option.delivery_title.toLowerCase().includes("standard")) {
          standardOption = option;
          console.log("Found standard option:", option);
        } else if (option.delivery_title.toLowerCase().includes("express")) {
          expressOption = option;
          console.log("Found express option:", option);
        }
      }
    }
  }

  const result = { standard: standardOption, express: expressOption };
  console.log("Available options result:", result);
  return result;
};

const SuccessModal = ({ isOpen, onClose, orderResult }) => {
  const [viewLoading, setViewLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const orderData = orderResult?.data;
  const transaction = orderData?.transaction;
  const items = orderData?.items || [];

  const subtotal = items.reduce((sum, item) => {
    return sum + item.quantity * parseFloat(item.order_price);
  }, 0);

  const deliveryCharge = parseFloat(orderData?.delivery_charge || 0);
  const grandTotal = (subtotal + deliveryCharge).toFixed(2);
  const subtotalFormatted = subtotal.toFixed(2);

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
                        <span className="summary-label">Subtotal:</span>
                        <span className="summary-value">
                          ${subtotalFormatted}
                        </span>
                      </div>

                      <div className="summary-row">
                        <span className="summary-label">Delivery Charge:</span>
                        <span className="summary-value price">
                          ${deliveryCharge.toFixed(2)}
                        </span>
                      </div>

                      <div className="summary-row">
                        <span className="summary-label">Total Amount:</span>
                        <span className="summary-value price">
                          ${grandTotal}
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
                              {item.quantity} × $
                              {parseFloat(item.order_price).toFixed(2)}
                            </span>
                          </div>

                          <div className="item-total">
                            $
                            {(
                              item.quantity * parseFloat(item.order_price)
                            ).toFixed(2)}
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

const PaymentFormComponent = forwardRef(
  (
    {
      formData,
      cartItems,
      subTotal,
      totalItems,
      totalWeight,
      deliveryCharge,
      grandTotal,
      selectedDeliveryType,
      onDeliveryTypeChange,
      onSuccess,
      onError,
      loading,
      setLoading,
      clientSecret,
      setShowPaymentForm,
      availableOptions,
    },
    ref,
  ) => {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState("");
    const [processingPayment, setProcessingPayment] = useState(false);

    useImperativeHandle(ref, () => ({
      resetForm: () => {
        setErrorMessage("");
        setProcessingPayment(false);
      },
    }));

    const confirmOrder = async (paymentIntentId) => {
      console.log("🔵 confirmOrder called with paymentIntentId:", paymentIntentId);

      try {
        const response = await orderAPI.confirmOrder({
          payment_intent_id: paymentIntentId,
        });

        console.log("✅ confirmOrder response:", response);

        if (response?.status === "success") {
          console.log("Order confirmed successfully!");
          onSuccess(response);
        } else {
          console.error("❌ Order confirmation failed:", response);
          throw new Error(response?.message || "Failed to confirm order");
        }
      } catch (err) {
        console.error("❌ Confirm order error:", err);
        console.error("❌ Error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          stack: err.stack,
        });
        onError(err.message || "Failed to confirm order");
      }
    };

    const handleSubmit = async (event) => {
      event.preventDefault();

      if (!stripe || !elements) {
        setErrorMessage("Stripe is not initialized. Please refresh the page.");
        return;
      }

      setProcessingPayment(true);
      setLoading(true);
      setErrorMessage("");

      try {
        const { error: submitError } = await elements.submit();

        if (submitError) {
          throw new Error(submitError.message);
        }

        const { error: confirmError, paymentIntent } =
          await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/payment-complete`,
            },
            redirect: "if_required",
          });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          await confirmOrder(paymentIntent.id);
        } else {
          throw new Error("Payment was not successful. Please try again.");
        }
      } catch (err) {
        console.error("Payment error:", err);
        setErrorMessage(err.message);
        onError(err.message);
      } finally {
        setProcessingPayment(false);
        setLoading(false);
      }
    };

    const handleBackToCart = () => {
      setShowPaymentForm(false);
    };

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
              <div className="checkout-badge">Payment Details</div>

              <div className="checkout-scroll-area pe-0 pe-md-2">
                <div className="mb-3">
                  <label className="checkout-label">Card Information *</label>
                  <div className="stripe-payment-element-wrapper">
                    <PaymentElement
                      options={{
                        layout: "tabs",
                        defaultValues: {
                          billingDetails: {
                            name: `${formData.firstName} ${formData.lastName}`,
                            email: formData.email,
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="alert alert-danger mt-2">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errorMessage}
                  </div>
                )}
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
              <div className="checkout-badge">Order Summary</div>

              <div className="checkout-order-items pe-0 pe-md-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="checkout-order-item">
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
                        <div>Quantity: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="checkout-order-right">
                      <div className="checkout-item-price">
                        $
                        {((item.sell_price || item.price) * item.quantity).toFixed(
                          2,
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cartItems.length > 0 && (
                <div className="delivery-options-section px-3">
                  <div className="checkout-badge mb-3">Delivery Options</div>
                  <div className="delivery-weight-info mb-3">
                    <span>
                      Total Package Weight:{" "}
                      <strong>
                        {totalWeight >= 1000
                          ? `${(totalWeight / 1000).toFixed(2)} kg`
                          : `${totalWeight} g`}
                      </strong>
                    </span>
                  </div>
                  <div className="delivery-options">
                    {availableOptions?.standard && (
                      <label className="delivery-option d-flex align-items-start gap-3 mb-3 p-2 border rounded">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="standard"
                          checked={selectedDeliveryType === "standard"}
                          onChange={(e) => onDeliveryTypeChange(e.target.value)}
                          disabled={loading}
                          className="mt-1"
                        />
                        <div className="delivery-option-content flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <span className="delivery-title fw-bold">
                              Standard Delivery
                            </span>
                            <span className="delivery-price fw-bold">
                              $
                              {parseFloat(
                                availableOptions.standard.delivery_price,
                              ).toFixed(2)}
                            </span>
                          </div>
                          <small className="delivery-description text-muted d-block">
                            {availableOptions.standard.deleivery_description ||
                              "5-8 business days"}
                          </small>
                        </div>
                      </label>
                    )}

                    {availableOptions?.express && (
                      <label className="delivery-option d-flex align-items-start gap-3 mb-3 p-2 border rounded">
                        <input
                          type="radio"
                          name="deliveryType"
                          value="express"
                          checked={selectedDeliveryType === "express"}
                          onChange={(e) => onDeliveryTypeChange(e.target.value)}
                          disabled={loading}
                          className="mt-1"
                        />
                        <div className="delivery-option-content flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <span className="delivery-title fw-bold">
                              Express Delivery
                            </span>
                            <span className="delivery-price fw-bold">
                              $
                              {parseFloat(
                                availableOptions.express.delivery_price,
                              ).toFixed(2)}
                            </span>
                          </div>
                          <small className="delivery-description text-muted d-block">
                            {availableOptions.express.deleivery_description ||
                              "1-2 business days"}
                          </small>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="checkout-footer px-3">
                <div className="checkout-subtotal d-flex justify-content-between mb-2">
                  <span>SUB TOTAL ({totalItems} items):</span>
                  <strong>${subTotal.toFixed(2)}</strong>
                </div>

                {cartItems.length > 0 && (
                  <div className="checkout-delivery-charge d-flex justify-content-between mb-2">
                    <span>DELIVERY CHARGE:</span>
                    <strong>${deliveryCharge.toFixed(2)}</strong>
                  </div>
                )}

                <div className="checkout-grand-total d-flex justify-content-between mb-3 pt-2 border-top">
                  <span className="fw-bold">TOTAL:</span>
                  <strong className="fs-5">
                    ${cartItems.length > 0 ? grandTotal.toFixed(2) : "0.00"}
                  </strong>
                </div>

                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-grow-1 py-2 rounded-pill"
                    onClick={handleBackToCart}
                    disabled={processingPayment}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning text-white flex-grow-1 py-2 rounded-pill"
                    disabled={!stripe || processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      `Pay $${cartItems.length > 0 ? grandTotal.toFixed(2) : "0.00"}`
                    )}
                  </button>
                </div>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="bi bi-shield-lock me-1"></i>
                    Secured by Stripe • 256-bit SSL encryption
                  </small>
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
  const googleMapsScriptRef = useRef(null);
  const checkoutRecaptchaRef = useRef(null);

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
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState("standard");
  const [deliveryOptions, setDeliveryOptions] = useState(null);
  const [deliveryOptionsLoading, setDeliveryOptionsLoading] = useState(true);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const handleCheckoutCaptchaChange = (token) => {
    setCaptchaToken(token || "");
    setCaptchaError("");
  };

  const resetCheckoutCaptcha = () => {
    setCaptchaToken("");
    setCaptchaError("");
    if (checkoutRecaptchaRef.current) {
      checkoutRecaptchaRef.current.reset();
    }
  };

  const totalWeight = useMemo(() => {
    const weight = cartItems.reduce((sum, item) => {
      const itemWeightGrams = item.weight || 0;
      return sum + itemWeightGrams * item.quantity;
    }, 0);
    console.log("Calculated total weight:", weight, "g");
    return weight;
  }, [cartItems]);

  const availableOptions = useMemo(() => {
    const options = getAvailableDeliveryOptions(totalWeight, deliveryOptions);
    console.log("Available options for weight", totalWeight, ":", options);
    return options;
  }, [totalWeight, deliveryOptions]);

  const deliveryCharge = useMemo(() => {
    if (!deliveryOptions || deliveryOptions.length === 0) return 0;
    if (totalWeight <= 0) return 0;

    let effectiveType = selectedDeliveryType;
    const hasStandard = availableOptions?.standard !== null;
    const hasExpress = availableOptions?.express !== null;

    if (hasStandard && !hasExpress) {
      effectiveType = "standard";
    } else if (!hasStandard && hasExpress) {
      effectiveType = "express";
    }

    const charge = calculateDeliveryChargeFromAPI(
      totalWeight,
      effectiveType,
      deliveryOptions,
    );
    console.log(
      `Delivery charge for ${effectiveType} with weight ${totalWeight}g: $${charge}`,
    );
    return charge;
  }, [totalWeight, selectedDeliveryType, deliveryOptions, availableOptions]);

  useEffect(() => {
    const hasStandard = availableOptions?.standard !== null;
    const hasExpress = availableOptions?.express !== null;

    if (hasStandard && !hasExpress) {
      setSelectedDeliveryType("standard");
    } else if (!hasStandard && hasExpress) {
      setSelectedDeliveryType("express");
    }
  }, [availableOptions]);

  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      try {
        setDeliveryOptionsLoading(true);
        const response = await deliveryAPI.getDeliveryOptions();

        console.log("Delivery options API response:", response);

        if (response?.status === "success" && response?.data) {
          setDeliveryOptions(response.data);
          console.log("Delivery options loaded:", response.data);
        } else {
          console.error("Failed to load delivery options:", response);
          setError("Unable to load delivery options. Please refresh the page.");
        }
      } catch (err) {
        console.error("Error fetching delivery options:", err);
        setError("Failed to load delivery options. Please check your connection.");
      } finally {
        setDeliveryOptionsLoading(false);
      }
    };

    fetchDeliveryOptions();
  }, []);

  useEffect(() => {
    console.log("Loading Google Maps...");

    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("Google Maps already loaded");
      setGoogleMapsLoaded(true);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key is missing!");
      setAddressError(
        "Address autocomplete is unavailable. Please enter your address manually.",
      );
      return;
    }

    if (googleMapsScriptRef.current) {
      googleMapsScriptRef.current.remove();
    }

    window.initGoogleMaps = () => {
      console.log("Google Maps callback executed");
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log("Google Maps loaded successfully");
        setGoogleMapsLoaded(true);
      } else {
        console.error("Google Maps loaded but Places API not available");
        setAddressError(
          "Address service partially loaded. Please enter address manually.",
        );
      }
      delete window.initGoogleMaps;
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      console.error("Failed to load Google Maps:", error);
      setAddressError("Unable to load address service. Please enter address manually.");
      delete window.initGoogleMaps;
    };

    document.head.appendChild(script);
    googleMapsScriptRef.current = script;

    return () => {
      if (googleMapsScriptRef.current) {
        googleMapsScriptRef.current.remove();
      }
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, []);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;
    let retryInterval;

    const initAutocomplete = () => {
      console.log(`Attempt ${retryCount + 1} to initialize autocomplete...`);

      if (!googleMapsLoaded) {
        console.log("Google Maps not ready yet");
        return false;
      }

      if (!addressInputRef.current) {
        console.log("Address input ref not available");
        return false;
      }

      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.error("Google Maps Places API not available");
        setAddressError("Address service unavailable. Please enter address manually.");
        return false;
      }

      if (autocompleteRef.current) {
        console.log("Autocomplete already initialized");
        return true;
      }

      try {
        console.log("Creating Autocomplete instance...");

        const autocompleteOptions = {
          types: ["address"],
          fields: ["address_components", "formatted_address", "geometry"],
          componentRestrictions: { country: "au" },
        };

        const autocomplete = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          autocompleteOptions,
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          console.log("Place selected:", place.formatted_address);

          if (place && place.address_components) {
            handlePlaceSelect(place);
          } else {
            console.warn("No place details available");
            setAddressError("Please select an address from the dropdown");
          }
        });

        autocompleteRef.current = autocomplete;
        setAddressError("");
        console.log("Autocomplete initialized successfully!");
        return true;
      } catch (err) {
        console.error("Error creating Autocomplete:", err);
        setAddressError(
          "Failed to initialize address autocomplete. Please enter address manually.",
        );
        return false;
      }
    };

    const tryInit = () => {
      if (initAutocomplete()) {
        if (retryInterval) clearInterval(retryInterval);
      } else if (retryCount < maxRetries) {
        retryCount++;
      } else {
        console.error("Max retries reached, autocomplete not initialized");
        setAddressError(
          "Address autocomplete not available. Please enter your address manually.",
        );
        if (retryInterval) clearInterval(retryInterval);
      }
    };

    const startDelay = setTimeout(() => {
      tryInit();
      retryInterval = setInterval(tryInit, 1000);
    }, 500);

    return () => {
      clearTimeout(startDelay);
      if (retryInterval) clearInterval(retryInterval);
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [googleMapsLoaded]);

  useEffect(() => {
    loadCartFromStorage();

    const handleCartUpdated = () => {
      loadCartFromStorage();
    };

    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdated);
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
      let weightKg = 0;
      let weightGrams = 0;

      if (item.dimensions && item.dimensions.weight) {
        weightKg = parseFloat(item.dimensions.weight);
        weightGrams = weightKg * 1000;
      }

      return {
        id: item.id,
        title: item.title || item.product_name,
        price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
        sell_price:
          typeof item.sell_price === "string"
            ? parseFloat(item.sell_price)
            : item.sell_price,
        quantity:
          typeof item.quantity === "string"
            ? parseInt(item.quantity, 10)
            : item.quantity || 1,
        image: item.image,
        weight: weightGrams,
        weightKg: weightKg,
        dimensions: item.dimensions,
        sku: item.sku,
        description: item.description,
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
      const itemPrice = item.sell_price || item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const grandTotal = useMemo(() => {
    return subTotal + deliveryCharge;
  }, [subTotal, deliveryCharge]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      if (addressInputRef.current) {
        addressInputRef.current.value = place.formatted_address || "";
      }

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

  const initializePayment = async () => {
    if (!validateAddress()) {
      setError("Please enter a complete address");
      return;
    }

    if (!captchaToken) {
      setCaptchaError("Please verify the reCAPTCHA before proceeding to payment.");
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullAddress = addressInputRef.current?.value?.trim() || "";

      const payload = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        ph_number: formData.phone,
        address_line1: fullAddress || formData.streetName,
        address_line2: formData.streetNo,
        city: formData.suburb,
        state: formData.state,
        postal_code: formData.postalCode,
        country: formData.country,
        delivery_charge: deliveryCharge,
        delivery_type: selectedDeliveryType,
        total_weight: totalWeight,
        captcha_token: captchaToken,
        products: cartItems.map((item) => ({
          product_id: parseInt(item.id, 10),
          quantity: parseInt(item.quantity, 10),
          price: parseFloat(item.sell_price || item.price),
          weight: item.weight,
        })),
      };

      const response = await orderAPI.createPaymentIntent(payload);

      if (response?.status === "success" && response.data?.client_secret) {
        setClientSecret(response.data.client_secret);
        setShowPaymentForm(true);
      } else {
        throw new Error(response?.message || "Failed to initialize payment");
      }
    } catch (err) {
      console.error("Payment initialization error:", err);
      setError(err.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
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

    resetCheckoutCaptcha();

    if (paymentFormResetRef.current) {
      paymentFormResetRef.current.resetForm();
    }

    setShowPaymentForm(false);
    setClientSecret(null);

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

  const formatWeight = (weightGrams) => {
    if (weightGrams >= 1000) {
      return `${(weightGrams / 1000).toFixed(2)} kg`;
    }
    return `${weightGrams} g`;
  };

  const hasZeroWeightItems = useMemo(() => {
    return cartItems.some((item) => item.weight === 0);
  }, [cartItems]);

  if (deliveryOptionsLoading) {
    return (
      <>
        <Banner
          title="CHECKOUT"
          subtitle="Tea first. Everything else later."
          breadcrumb="HOME > CHECKOUT"
          bgImage={bannerBg}
        />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading delivery options...</span>
          </div>
          <p className="mt-3">Loading checkout...</p>
        </div>
      </>
    );
  }

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

          {hasZeroWeightItems && (
            <div
              className="alert alert-warning alert-dismissible fade show mb-4"
              role="alert"
            >
              <strong>Warning:</strong> Some items in your cart have no weight
              specified. Delivery charges may not be accurate.
              <button type="button" className="btn-close" onClick={() => {}}></button>
            </div>
          )}

          {!showPaymentForm ? (
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
                        onChange={handleChange}
                        required
                        disabled={loading}
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
                        onChange={handleChange}
                        required
                        disabled={loading}
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
                        onChange={handleChange}
                        required
                        disabled={loading}
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
                        onChange={handleChange}
                        required
                        disabled={loading}
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
                          placeholder="Start typing your address..."
                          autoComplete="off"
                          disabled={loading}
                        />
                        <small className="text-muted">
                          Enter your street address, city, or postcode
                        </small>
                      </div>

                      <div className="mb-3">
                        <ReCAPTCHA
                          ref={checkoutRecaptchaRef}
                          sitekey="6LfTOPoqAAAAALiP94ZP6TEYP5XiTsKjvr7dpYh9"
                          onChange={handleCheckoutCaptchaChange}
                        />
                        {captchaError && (
                          <div className="text-danger mt-2 small">
                            {captchaError}
                          </div>
                        )}
                      </div>

                      <input type="hidden" name="streetNo" value={formData.streetNo} />
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
                      <input type="hidden" name="country" value={formData.country} />
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
                                  disabled={loading}
                                >
                                  <FaMinus />
                                </button>
                                <span>{String(item.quantity).padStart(2, "0")}</span>
                                <button
                                  type="button"
                                  onClick={() => increaseQty(item.id)}
                                  disabled={loading}
                                >
                                  <FaPlus />
                                </button>
                              </div>
                              {item.weight > 0 && (
                                <small className="text-muted">
                                  Weight: {formatWeight(item.weight)}
                                </small>
                              )}
                            </div>
                          </div>

                          <div className="checkout-order-right">
                            <div className="checkout-item-price">
                              $
                              {(
                                (item.sell_price || item.price) * item.quantity
                              ).toFixed(2)}
                            </div>

                            <button
                              type="button"
                              className="checkout-delete-btn"
                              onClick={() => removeCartItem(item.id)}
                              disabled={loading}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {cartItems.length > 0 && (
                    <div className="delivery-options-section px-3">
                      <div className="checkout-badge mb-3">Delivery Options</div>
                      <div className="delivery-weight-info mb-3">
                        <span>
                          Total Package Weight:{" "}
                          <strong>{formatWeight(totalWeight)}</strong>
                        </span>
                      </div>
                      <div className="delivery-options">
                        {availableOptions?.standard && (
                          <label className="delivery-option d-flex align-items-start gap-3 mb-3 p-2 border rounded">
                            <input
                              type="radio"
                              name="deliveryType"
                              value="standard"
                              checked={selectedDeliveryType === "standard"}
                              onChange={(e) =>
                                handleDeliveryTypeChange(e.target.value)
                              }
                              disabled={loading}
                              className="mt-1"
                            />
                            <div className="delivery-option-content flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <span className="delivery-title fw-bold">
                                  Standard Delivery
                                </span>
                                <span className="delivery-price fw-bold">
                                  $
                                  {parseFloat(
                                    availableOptions.standard.delivery_price,
                                  ).toFixed(2)}
                                </span>
                              </div>
                              <small className="delivery-description text-muted d-block">
                                {availableOptions.standard.deleivery_description ||
                                  "5-8 business days"}
                              </small>
                            </div>
                          </label>
                        )}

                        {availableOptions?.express && (
                          <label className="delivery-option d-flex align-items-start gap-3 mb-3 p-2 border rounded">
                            <input
                              type="radio"
                              name="deliveryType"
                              value="express"
                              checked={selectedDeliveryType === "express"}
                              onChange={(e) =>
                                handleDeliveryTypeChange(e.target.value)
                              }
                              disabled={loading}
                              className="mt-1"
                            />
                            <div className="delivery-option-content flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <span className="delivery-title fw-bold">
                                  Express Delivery
                                </span>
                                <span className="delivery-price fw-bold">
                                  $
                                  {parseFloat(
                                    availableOptions.express.delivery_price,
                                  ).toFixed(2)}
                                </span>
                              </div>
                              <small className="delivery-description text-muted d-block">
                                {availableOptions.express.deleivery_description ||
                                  "1-2 business days"}
                              </small>
                            </div>
                          </label>
                        )}

                        {!availableOptions?.standard && !availableOptions?.express && (
                          <div className="alert alert-danger">
                            <strong>Error:</strong> No delivery options available for
                            this weight ({formatWeight(totalWeight)}). Please contact
                            support.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="checkout-footer px-3">
                    <div className="checkout-subtotal d-flex justify-content-between mb-2">
                      <span>SUB TOTAL ({totalItems} items):</span>
                      <strong>${subTotal.toFixed(2)}</strong>
                    </div>

                    {cartItems.length > 0 && (
                      <div className="checkout-delivery-charge d-flex justify-content-between mb-2">
                        <span>DELIVERY CHARGE:</span>
                        <strong>${deliveryCharge.toFixed(2)}</strong>
                      </div>
                    )}

                    <div className="checkout-grand-total d-flex justify-content-between mb-3 pt-2 border-top">
                      <span className="fw-bold">TOTAL:</span>
                      <strong className="fs-5">
                        ${cartItems.length > 0 ? grandTotal.toFixed(2) : "0.00"}
                      </strong>
                    </div>

                    <div className="checkout-btn-group">
                      <button
                        type="button"
                        className="checkout-btn primary-btn w-100 py-2 rounded-pill"
                        onClick={initializePayment}
                        disabled={
                          loading ||
                          cartItems.length === 0 ||
                          (!availableOptions?.standard && !availableOptions?.express)
                        }
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Initializing Payment...
                          </>
                        ) : (
                          `Proceed to Payment • $${
                            cartItems.length > 0 ? grandTotal.toFixed(2) : "0.00"
                          }`
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentFormComponent
                ref={paymentFormResetRef}
                formData={formData}
                cartItems={cartItems}
                subTotal={subTotal}
                totalItems={totalItems}
                totalWeight={totalWeight}
                deliveryCharge={deliveryCharge}
                grandTotal={grandTotal}
                selectedDeliveryType={selectedDeliveryType}
                onDeliveryTypeChange={handleDeliveryTypeChange}
                onSuccess={handleOrderSuccess}
                onError={handleOrderError}
                loading={loading}
                setLoading={setLoading}
                clientSecret={clientSecret}
                setShowPaymentForm={setShowPaymentForm}
                availableOptions={availableOptions}
              />
            </Elements>
          )}
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