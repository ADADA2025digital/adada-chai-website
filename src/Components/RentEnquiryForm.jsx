import React, { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../Config/axiosConfig";

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
        selectedProductId: productId,
        selectedProductTitle: productTitle,
      }));
    }
  }, [productId, productTitle, productsList]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log("=== FORM SUBMISSION STARTED ===");
    // console.log("Form Data:", formData);
    // console.log("Captcha Token Present:", !!captchaToken);

    if (!validate()) {
      // console.log("Validation failed");
      return;
    }

    if (!captchaToken) {
      // console.log("Captcha token missing");
      setCaptchaError("Please verify the reCAPTCHA");
      setShowRecaptcha(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: null });

    try {
      const payload = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone_number: formData.phone,
        product_id: parseInt(formData.selectedProductId),
        query: formData.message,
        recaptchaToken: captchaToken,
      };

      // console.log("Sending payload to backend:", payload);
      
      // Using axios instead of fetch
      const response = await api.post("/rent/request", payload);
      
      // console.log("Response data from backend:", response.data);

      if (response.data.status === "success") {
        // console.log("Form submission successful according to API");
        setSubmitStatus({
          type: "success",
          message: response.data.message || "Rent request submitted successfully! We'll contact you shortly.",
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

        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }

        setTimeout(() => {
          setSubmitStatus({ type: null, message: null });
        }, 5000);
      } else {
        // console.log("API returned error status:", response.data);
        if (response.data.errors) {
          // console.log("Validation errors from backend:", response.data.errors);
          const apiErrors = {};
          Object.keys(response.data.errors).forEach((key) => {
            apiErrors[key] = response.data.errors[key][0];
          });
          setErrors(apiErrors);
          setSubmitStatus({
            type: "error",
            message: "Please check the form for errors.",
          });
        } else {
          throw new Error(response.data.message || "Failed to submit rent request");
        }
      }
    } catch (error) {
      // console.error("Network or other error:", error);
      // console.error("Error details:", {
      //   message: error.message,
      //   response: error.response?.data,
      //   status: error.response?.status,
      //   stack: error.stack,
      //   name: error.name
      // });
      
      // Handle different error scenarios
      let errorMessage = "Failed to submit rent request. Please try again later.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          const apiErrors = {};
          Object.keys(error.response.data.errors).forEach((key) => {
            apiErrors[key] = error.response.data.errors[key][0];
          });
          setErrors(apiErrors);
          errorMessage = "Please check the form for errors.";
        } else {
          errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your internet connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || errorMessage;
      }
      
      setSubmitStatus({
        type: "error",
        message: errorMessage,
      });

      setTimeout(() => {
        setSubmitStatus({ type: null, message: null });
      }, 5000);
    } finally {
      setIsSubmitting(false);
      // console.log("=== FORM SUBMISSION COMPLETED ===");
    }
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

      <form onSubmit={handleSubmit}>
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
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RentEnquiryForm;