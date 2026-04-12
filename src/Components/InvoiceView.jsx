import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Config/axiosConfig"; 

const InvoiceProxy = () => {
  const { token, action } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleInvoice = async () => {
      if (!token || !action) {
        setError("Invalid invoice request");
        setLoading(false);
        return;
      }

      try {
        if (action === "view") {
          // Use your axios instance to fetch the invoice
          const response = await api.get(`/invoices/view/${token}`, {
            responseType: "blob",
            headers: {
              Accept: "application/pdf, text/html, application/json",
            },
          });

          const contentType = response.headers["content-type"];

          if (contentType === "application/pdf") {
            // Create blob URL for PDF
            const blobUrl = window.URL.createObjectURL(response.data);
            
            // Replace current window with PDF
            window.location.href = blobUrl;
            
            // Clean up blob URL after navigation (optional)
            setTimeout(() => {
              window.URL.revokeObjectURL(blobUrl);
            }, 1000);
          } 
          else if (contentType === "text/html") {
            // If it's HTML, display in current window
            const htmlContent = await response.data.text();
            document.open();
            document.write(htmlContent);
            document.close();
          } 
          else if (contentType === "application/json") {
            // If JSON response, check for URL or error
            const text = await response.data.text();
            const jsonData = JSON.parse(text);
            
            if (jsonData.view_url) {
              // Redirect to the actual view URL
              window.location.href = jsonData.view_url;
            } else if (jsonData.message) {
              throw new Error(jsonData.message);
            } else {
              throw new Error("Invalid response format");
            }
          } 
          else {
            throw new Error("Unsupported content type");
          }
        } 
        else if (action === "download") {
          // Use your axios instance for download
          const response = await api.get(`/invoices/download/${token}`, {
            responseType: "blob",
            headers: {
              Accept: "application/pdf",
            },
          });

          // Check if response is PDF
          const contentType = response.headers["content-type"];
          if (contentType !== "application/pdf") {
            // Try to parse as JSON error
            const text = await response.data.text();
            try {
              const errorData = JSON.parse(text);
              throw new Error(errorData.message || "Failed to download invoice");
            } catch {
              throw new Error("Invalid response format");
            }
          }

          // Create download link
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          
          // Extract filename from Content-Disposition header if available
          const contentDisposition = response.headers["content-disposition"];
          let filename = `invoice_${token.substring(0, 8)}.pdf`;
          
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, '');
            }
          }
          
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          // Close the window after download starts
          setTimeout(() => {
            window.close();
          }, 2000);
        }
      } catch (err) {
        console.error("Invoice proxy error:", err);
        
        // Handle different error types
        let errorMessage = "Failed to load invoice. Please try again.";
        
        if (err.response) {
          // Server responded with error status
          if (err.response.status === 400) {
            errorMessage = "Invalid or expired invoice link.";
          } else if (err.response.status === 404) {
            errorMessage = "Invoice not found.";
          } else if (err.response.status === 500) {
            errorMessage = "Server error. Please try again later.";
          }
          
          // Try to get message from response data
          if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    handleInvoice();
  }, [token, action]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center p-3">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Error Loading Invoice</h4>
            <p>{error}</p>
            <hr />
            <button 
              className="btn btn-primary me-3" 
              onClick={() => window.close()}
            >
              Close Window
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InvoiceProxy;