import React, { useState } from "react";

const RentEnquiryForm = ({ productTitle }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const firstNameRegex = /^[A-Za-z\s]{2,30}$/;
  const lastNameRegex = /^[A-Za-z\s]{1,30}$/;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phoneRegex = /^[0-9+\-\s]{8,15}$/;
  const messageRegex = /^.{10,500}$/;

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
      const finalPayload = {
        ...formData,
        product: productTitle,
      };

      console.log("Rent enquiry submitted:", finalPayload);
      alert("Rent enquiry submitted successfully!");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });

      setErrors({});
    }
  };

  return (
    <div className="rent-form-card p-3 p-md-4 p-lg-5">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6 col-12">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className={`form-control rent-form-input ${
                errors.firstName ? "is-invalid" : ""
              }`}
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && (
              <div className="rent-form-error">{errors.firstName}</div>
            )}
          </div>

          <div className="col-md-6 col-12">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className={`form-control rent-form-input ${
                errors.lastName ? "is-invalid" : ""
              }`}
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && (
              <div className="rent-form-error">{errors.lastName}</div>
            )}
          </div>

          <div className="col-md-6 col-12">
            <input
              type="text"
              name="email"
              placeholder="Email Address"
              className={`form-control rent-form-input ${
                errors.email ? "is-invalid" : ""
              }`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="rent-form-error">{errors.email}</div>
            )}
          </div>

          <div className="col-md-6 col-12">
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className={`form-control rent-form-input ${
                errors.phone ? "is-invalid" : ""
              }`}
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <div className="rent-form-error">{errors.phone}</div>
            )}
          </div>

          <div className="col-12">
            <textarea
              name="message"
              rows="4"
              placeholder="Write your query here"
              className={`form-control rent-form-input rent-form-textarea ${
                errors.message ? "is-invalid" : ""
              }`}
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            {errors.message && (
              <div className="rent-form-error">{errors.message}</div>
            )}
          </div>

          <div className="col-12 text-end">
            <button
              type="submit"
              className="rent-submit-btn w-100 w-md-auto"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RentEnquiryForm;