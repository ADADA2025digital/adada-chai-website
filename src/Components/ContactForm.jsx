import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { contactAPI } from "../Config/route";

const ContactForm = () => {
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [showRecaptcha, setShowRecaptcha] = useState(false);

  const nameRegex = /^[A-Za-z\s]{3,50}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phoneRegex = /^[0-9+\-\s]{8,15}$/;
  const messageRegex = /^.{10,500}$/;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Enter a valid name (3-50 characters, letters only)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid phone number (8-15 characters)";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (!messageRegex.test(formData.message.trim())) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    if (submitStatus.message) {
      setSubmitStatus({ type: "", message: "" });
    }

    if (name === "message") {
      if (value.trim()) {
        setShowRecaptcha(true);
      } else if (!captchaToken) {
        setShowRecaptcha(false);
      }
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token || "");
    setCaptchaError("");
  };

  const handleMessageFocus = () => {
    setShowRecaptcha(true);
  };

  const handleMessageBlur = () => {
    if (!formData.message.trim() && !captchaToken) {
      setShowRecaptcha(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFormValid = validate();

    if (!isFormValid) return;

    if (!captchaToken) {
      setCaptchaError("Please verify the reCAPTCHA");
      setShowRecaptcha(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const payload = {
        ...formData,
        recaptchaToken: captchaToken,
      };

      const response = await contactAPI.submitContactForm(payload);

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      setErrors({});
      setCaptchaToken("");
      setCaptchaError("");
      setShowRecaptcha(false);

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      setSubmitStatus({
        type: "success",
        message: response.message || "Message sent successfully!",
      });

      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
    } catch (error) {
      console.error("Failed to submit form:", error);

      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to send message. Please try again.",
      });

      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-card mx-3 mx-lg-auto">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            name="name"
            className={`form-control contact-input ${errors.name ? "is-invalid" : ""}`}
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.name && <div className="contact-error">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <input
            type="email"
            name="email"
            className={`form-control contact-input ${errors.email ? "is-invalid" : ""}`}
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.email && <div className="contact-error">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <input
            type="tel"
            name="phone"
            className={`form-control contact-input ${errors.phone ? "is-invalid" : ""}`}
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          {errors.phone && <div className="contact-error">{errors.phone}</div>}
        </div>

        <div className="mb-3">
          <textarea
            name="message"
            rows="5"
            className={`form-control contact-input contact-textarea ${errors.message ? "is-invalid" : ""}`}
            placeholder="Write Message"
            value={formData.message}
            onChange={handleChange}
            onFocus={handleMessageFocus}
            onBlur={handleMessageBlur}
            disabled={isSubmitting}
          ></textarea>
          {errors.message && <div className="contact-error">{errors.message}</div>}
        </div>

        {submitStatus.message && (
          <div
            className={`alert alert-${submitStatus.type === "success" ? "success" : "danger"} mb-3`}
            role="alert"
          >
            {submitStatus.message}
          </div>
        )}

        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
          <div className="flex-grow-1">
            {showRecaptcha && (
              <>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LfTOPoqAAAAALiP94ZP6TEYP5XiTsKjvr7dpYh9"
                  onChange={handleCaptchaChange}
                />
                {captchaError && <div className="contact-error mt-2">{captchaError}</div>}
              </>
            )}
          </div>

          <div className="text-end">
            <button
              type="submit"
              className="btn contact-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send a Message"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;