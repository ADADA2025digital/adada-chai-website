import api from "./axiosConfig";

export const categoryAPI = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await api.get("/categories");
      console.log("Raw API Response:", response);

      // Return the appropriate data structure
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};

// Products API
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await api.get("/products");
      console.log("Products API Response:", response);

      // Extract the products array from the response
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
};

// Reviews API
export const reviewAPI = {
  // Get all reviews (approved only)
  getAllReviews: async (productId = null) => {
    try {
      // Build URL with optional product_id query parameter
      let url = "/reviews";
      if (productId) {
        url += `?product_id=${productId}`;
      }

      const response = await api.get(url);
      console.log("Reviews API Response:", response);

      // Extract the reviews array from the response
      let reviewsArray = [];

      if (response.data && response.data.data) {
        reviewsArray = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        reviewsArray = response.data;
      } else if (Array.isArray(response.data)) {
        reviewsArray = response.data;
      }

      // Filter to only include approved reviews
      const approvedReviews = reviewsArray.filter(
        (review) =>
          review.review_status === "approved" ||
          review.review_status === "Approved",
      );

      console.log("Approved reviews:", approvedReviews);
      return approvedReviews;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },
};

// Order API
export const orderAPI = {
  // Place a guest order
  placeGuestOrder: async (orderData) => {
    try {
      const response = await api.post("/orders", orderData);
      console.log("Order placed successfully:", response);
      return response.data;
    } catch (error) {
      console.error("Error placing order:", error);
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to place order");
      } else if (error.request) {
        throw new Error(
          "No response from server. Please check your connection.",
        );
      } else {
        throw new Error(
          error.message || "An error occurred while placing order",
        );
      }
    }
  },

  // Stripe Payment Intent endpoints
  createPaymentIntent: async (orderData) => {
    try {
      const response = await api.post("/guest/create-payment-intent", orderData);
      console.log("Create payment intent response:", response.data);
      return response.data; // This returns { status: "success", data: {...} }
    } catch (error) {
      console.error("Create payment intent API error:", error);
      throw error;
    }
  },
  
  confirmOrder: async (data) => {
    try {
      const response = await api.post("/guest/confirm-order", data);
      console.log("Confirm order response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Confirm order API error:", error);
      throw error;
    }
  },
  
  getPaymentStatus: async (paymentIntentId) => {
    try {
      const response = await api.get(`/guest/payment-status/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error("Get payment status error:", error);
      throw error;
    }
  },
  
  cancelPaymentIntent: async (data) => {
    try {
      const response = await api.post("/guest/cancel-payment", data);
      console.log("Cancel payment response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Cancel payment error:", error);
      throw error;
    }
  },

  // Invoice endpoints
  getInvoiceByToken: (token) => api.get(`/invoices/view/${token}`),
  downloadInvoice: (token) =>
    api.get(`/invoices/download/${token}`, {
      responseType: "blob",
    }),
};

// Contact API
export const contactAPI = {
  submitContactForm: async (formData) => {
    try {
      const response = await api.post("/contacts", {
        sender_name: formData.name,
        sender_email: formData.email,
        sender_ph_no: formData.phone,
        sender_message: formData.message,
      });
      console.log("Contact form submitted successfully:", response);
      return response.data;
    } catch (error) {
      console.error("Error submitting contact form:", error);

      if (error.response) {
        console.log("Error response status:", error.response.status);
        console.log("Error response data:", error.response.data);

        if (error.response.data && error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          const errorMessages = [];

          Object.keys(validationErrors).forEach((key) => {
            errorMessages.push(`${key}: ${validationErrors[key].join(", ")}`);
          });

          throw new Error(`Validation failed: ${errorMessages.join("; ")}`);
        } else if (error.response.data && error.response.data.message) {
          throw new Error(error.response.data.message);
        } else {
          throw new Error(`Server error (${error.response.status})`);
        }
      } else if (error.request) {
        console.log("No response received:", error.request);
        throw new Error(
          "No response from server. Please check your connection.",
        );
      } else {
        console.log("Error message:", error.message);
        throw new Error(
          error.message || "An error occurred while submitting the form",
        );
      }
    }
  },
};

// Delivery Options API
export const deliveryAPI = {
  // Get all delivery options from backend
  getDeliveryOptions: () => {
    return api.get('/delivery-options')
      .then(response => response.data)
      .catch(error => {
        console.error('Failed to fetch delivery options:', error);
        throw error.response?.data || error;
      });
  },
};