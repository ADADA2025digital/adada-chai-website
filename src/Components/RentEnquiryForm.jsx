import React, { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from "../Config/axiosConfig";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51T6ky36nDiic8XlH4wGGMNX2VgNqrXqMBCBx5G0YNwWmCs5MVUkLCCpGitUZcWm35JQ8YcSa2PYzr1lEezzZxuPC00KDmlUv6J");

// Inner component that uses Stripe hooks
const PaymentForm = ({ 
  onSubmitSuccess, 
  onSubmitError,
  amount,
  clientSecret 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Check if Stripe and Elements are ready
  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true);
    }
  }, [stripe, elements]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setErrorMessage("Stripe is not initialized yet. Please wait.");
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setErrorMessage(submitError.message);
        setProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        console.error("Payment confirmation error:", confirmError);
        setErrorMessage(confirmError.message);
        onSubmitError(confirmError.message);
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await confirmRentRequest(paymentIntent.id);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage('An unexpected error occurred');
      onSubmitError(err.message);
      setProcessing(false);
    }
  };

  const confirmRentRequest = async (paymentIntentId) => {
    try {
      const response = await api.post('/rent/confirm', {
        payment_intent_id: paymentIntentId,
      });

      if (response.data.status === "success") {
        onSubmitSuccess(response.data);
      } else {
        throw new Error(response.data.message || "Failed to confirm rent request");
      }
    } catch (error) {
      console.error("Confirm rent request error:", error);
      onSubmitError(error.response?.data?.message || error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form rounded-4 p-4">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Payment Details</h5>
          <span className="text-muted">Amount: ${amount?.toFixed(2)} AUD</span>
        </div>
        
        <div className="mb-3">
          <PaymentElement 
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  name: 'John Doe',
                }
              }
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
      
      <div className="d-flex gap-2 mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary flex-grow-1 py-2 rounded-pill"
          onClick={handleCancel}
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-warning text-white flex-grow-1 py-2 rounded-pill"
          disabled={!isReady || processing}
          style={{ opacity: (!isReady || processing) ? 0.6 : 1 }}
        >
          {processing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Processing...
            </>
          ) : (
            `Pay $${amount?.toFixed(2)}`
          )}
        </button>
      </div>

      <div className="text-center mt-3">
        <small className="text-muted">
          <i className="bi bi-shield-lock me-1"></i>
          Secured by Stripe • 256-bit SSL encryption
        </small>
      </div>
    </form>
  );
};

// Main RentEnquiryForm Component
const RentEnquiryForm = ({ productTitle, productId, productsList = [] }) => {
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    selectedProductId: productId || "",
    selectedProductTitle: productTitle || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: null });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [rentAmount, setRentAmount] = useState(0);

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [showRecaptcha, setShowRecaptcha] = useState(false);

  const firstNameRegex = /^[A-Za-z\s]{2,30}$/;
  const lastNameRegex = /^[A-Za-z\s]{1,30}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phoneRegex = /^[0-9+\-\s]{8,15}$/;
  const messageRegex = /^.{10,500}$/;

  useEffect(() => {
    if (productId && productTitle && productsList.length > 0) {
      setFormData((prev) => ({
        ...prev,
        selectedProductId: productId.toString(),
        selectedProductTitle: productTitle,
      }));
    }
  }, [productId, productTitle, productsList]);

  // Calculate rent amount based on selected product
  useEffect(() => {
    if (formData.selectedProductId && productsList.length > 0) {
      const selectedProduct = productsList.find(
        (p) => p.id === parseInt(formData.selectedProductId)
      );
      
      let amount = 0;
      
      if (selectedProduct && selectedProduct.rent_price) {
        amount = parseFloat(selectedProduct.rent_price);
      } else if (selectedProduct && selectedProduct.price) {
        // Default to 10% of price
        amount = selectedProduct.price * 0.1;
      }
      
      // Ensure minimum amount is $10
      const finalAmount = Math.max(amount, 10);
      setRentAmount(finalAmount);
    }
  }, [formData.selectedProductId, productsList]);

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!firstNameRegex.test(formData.firstName.trim())) {
      newErrors.firstName = "Enter a valid first name";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!lastNameRegex.test(formData.lastName.trim())) {
      newErrors.lastName = "Enter a valid last name";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (!messageRegex.test(formData.message.trim())) {
      newErrors.message = "Message must be at least 10 characters";
    }

    if (!formData.selectedProductId) {
      newErrors.selectedProductId = "Please select a product";
    }

    if (rentAmount < 10) {
      newErrors.rentAmount = "Rent amount must be at least $10";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "selectedProductId") {
      const selectedProduct = productsList.find((p) => p.id === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        selectedProductId: value,
        selectedProductTitle: selectedProduct ? selectedProduct.title : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (name === "message") {
      if (value.trim()) {
        setShowRecaptcha(true);
      } else if (!captchaToken) {
        setShowRecaptcha(false);
      }
    }

    if (submitStatus.message) {
      setSubmitStatus({ type: null, message: null });
    }
  };

  const handleMessageFocus = () => {
    setShowRecaptcha(true);
  };

  const handleMessageBlur = () => {
    if (!formData.message.trim() && !captchaToken) {
      setShowRecaptcha(false);
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token || "");
    setCaptchaError("");
  };

  const createPaymentIntent = async () => {
    const finalAmount = Math.max(rentAmount, 10);
    
    const payload = {
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone_number: formData.phone,
      product_id: parseInt(formData.selectedProductId),
      query: formData.message,
      rent_initial_amount: finalAmount,
    };

    console.log("Sending payload:", payload);

    try {
      const response = await api.post('/rent/create-payment-intent', payload);

      if (response.data.status === "success") {
        setClientSecret(response.data.data.client_secret);
        setPaymentIntentId(response.data.data.payment_intent_id);
        setShowPaymentForm(true);
        return true;
      } else {
        throw new Error(response.data.message || "Failed to create payment intent");
      }
    } catch (error) {
      console.error("Create payment intent error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors || 
                          error.message || 
                          "Failed to initialize payment. Please try again.";
      
      setSubmitStatus({
        type: "error",
        message: typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage,
      });
      return false;
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (!captchaToken) {
      setCaptchaError("Please verify the reCAPTCHA");
      setShowRecaptcha(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: null });

    const success = await createPaymentIntent();
    
    if (!success) {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (data) => {
    setSubmitStatus({
      type: "success",
      message: data.message || "Rent request submitted successfully! We'll contact you shortly.",
    });

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
      selectedProductId: "",
      selectedProductTitle: "",
    });
    
    setErrors({});
    setCaptchaToken("");
    setCaptchaError("");
    setShowRecaptcha(false);
    setShowPaymentForm(false);
    setClientSecret(null);
    setPaymentIntentId(null);
    setIsSubmitting(false);

    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }

    setTimeout(() => {
      setSubmitStatus({ type: null, message: null });
    }, 5000);
  };

  const handlePaymentError = (error) => {
    setSubmitStatus({
      type: "error",
      message: error || "Payment failed. Please try again.",
    });
    setIsSubmitting(false);
    // Don't hide payment form on error, let user try again
  };

  return (
    <div className="rent-form-card p-3 p-md-4 p-lg-5">
      {submitStatus.type && (
        <div
          className={`alert alert-${
            submitStatus.type === "success" ? "success" : "danger"
          } mb-4`}
          role="alert"
        >
          {submitStatus.message}
        </div>
      )}

      {!showPaymentForm ? (
        <form onSubmit={handleInitialSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <select
                name="selectedProductId"
                className={`form-control rent-form-input ${
                  errors.selectedProductId ? "is-invalid" : ""
                }`}
                value={formData.selectedProductId}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select a product *</option>
                {productsList.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} - $
                    {typeof product.price === "number"
                      ? product.price.toFixed(2)
                      : product.price}
                    {product.rent_price && ` (Rent: $${product.rent_price})`}
                  </option>
                ))}
              </select>
              {errors.selectedProductId && (
                <div className="rent-form-error">{errors.selectedProductId}</div>
              )}
            </div>

            <div className="col-md-6 col-12">
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                className={`form-control rent-form-input ${
                  errors.firstName ? "is-invalid" : ""
                }`}
                value={formData.firstName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <div className="rent-form-error">{errors.firstName}</div>
              )}
            </div>

            <div className="col-md-6 col-12">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name *"
                className={`form-control rent-form-input ${
                  errors.lastName ? "is-invalid" : ""
                }`}
                value={formData.lastName}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <div className="rent-form-error">{errors.lastName}</div>
              )}
            </div>

            <div className="col-md-6 col-12">
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                className={`form-control rent-form-input ${
                  errors.email ? "is-invalid" : ""
                }`}
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="rent-form-error">{errors.email}</div>
              )}
            </div>

            <div className="col-md-6 col-12">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                className={`form-control rent-form-input ${
                  errors.phone ? "is-invalid" : ""
                }`}
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <div className="rent-form-error">{errors.phone}</div>
              )}
            </div>

            <div className="col-12">
              <textarea
                name="message"
                rows="4"
                placeholder="Write your query here *"
                className={`form-control rent-form-input rent-form-textarea ${
                  errors.message ? "is-invalid" : ""
                }`}
                value={formData.message}
                onChange={handleChange}
                onFocus={handleMessageFocus}
                onBlur={handleMessageBlur}
                disabled={isSubmitting}
              ></textarea>
              {errors.message && (
                <div className="rent-form-error">{errors.message}</div>
              )}
            </div>

            <div className="col-12">
              {showRecaptcha && (
                <>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LfTOPoqAAAAALiP94ZP6TEYP5XiTsKjvr7dpYh9"
                    onChange={handleCaptchaChange}
                  />
                  {captchaError && (
                    <div className="rent-form-error mt-2">{captchaError}</div>
                  )}
                </>
              )}
            </div>

            <div className="col-12 text-end">
              <button
                type="submit"
                className="rent-submit-btn w-100 w-md-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Processing...
                  </>
                ) : (
                  `Proceed to Payment - $${rentAmount?.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            onSubmitSuccess={handlePaymentSuccess}
            onSubmitError={handlePaymentError}
            amount={rentAmount}
            clientSecret={clientSecret}
          />
        </Elements>
      )}
    </div>
  );
};

export default RentEnquiryForm;