import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const nameRegex = /^[A-Za-z\s]{3,50}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phoneRegex = /^[0-9+\-\s]{8,15}$/;
  const messageRegex = /^.{10,500}$/;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Enter a valid name";
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      console.log("Form submitted:", formData);

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      setErrors({});
      alert("Message sent successfully!");
    }
  };

  return (
    <div className="contact-form-card mx-3 mx-lg-auto">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            name="name"
            className={`form-control contact-input ${
              errors.name ? "is-invalid" : ""
            }`}
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <div className="contact-error">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <input
            type="text"
            name="email"
            className={`form-control contact-input ${
              errors.email ? "is-invalid" : ""
            }`}
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <div className="contact-error">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <input
            type="text"
            name="phone"
            className={`form-control contact-input ${
              errors.phone ? "is-invalid" : ""
            }`}
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <div className="contact-error">{errors.phone}</div>}
        </div>

        <div className="mb-3">
          <textarea
            name="message"
            rows="5"
            className={`form-control contact-input contact-textarea ${
              errors.message ? "is-invalid" : ""
            }`}
            placeholder="Write Message"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          {errors.message && (
            <div className="contact-error">{errors.message}</div>
          )}
        </div>

        <div className="text-end text-md-end text-center">
          <button type="submit" className="btn contact-submit-btn">
            Send a Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;