import api from "./api"; // Your existing axios config

export const invoiceAPI = {
  /**
   * View invoice - returns PDF blob
   * @param {string} token - The encrypted transaction ID
   * @returns {Promise<Blob>} PDF blob
   */
  viewInvoice: async (token) => {
    try {
      const response = await api.get(`/invoices/view/${token}`, {
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf',
        },
      });
      return response.data;
    } catch (error) {
      console.error("View invoice error:", error);
      throw error;
    }
  },

  /**
   * Download invoice - returns PDF blob with filename
   * @param {string} token - The encrypted transaction ID
   * @returns {Promise<{blob: Blob, filename: string}>}
   */
  downloadInvoice: async (token) => {
    try {
      const response = await api.get(`/invoices/download/${token}`, {
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf',
        },
      });
      
      // Extract filename from Content-Disposition header
      let filename = `invoice_${token.substring(0, 8)}.pdf`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }
      
      return {
        blob: response.data,
        filename: filename
      };
    } catch (error) {
      console.error("Download invoice error:", error);
      throw error;
    }
  },
};