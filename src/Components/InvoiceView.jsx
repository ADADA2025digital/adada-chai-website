import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        
        if (action === "view") {
          // Fetch the invoice for viewing
          const response = await axios.get(
            `${API_BASE_URL}/api/invoices/view/${token}`,
            {
              responseType: "blob",
              headers: {
                Accept: "application/pdf, text/html, application/json",
              },
            }
          );

          // Check content type and handle accordingly
          const contentType = response.headers["content-type"];

          if (contentType === "application/pdf") {
            // Create blob URL for PDF
            const blobUrl = window.URL.createObjectURL(response.data);
            
            // Instead of opening a new window, redirect the current window
            // This will keep the window open and display the PDF
            window.location.href = blobUrl;
            
            // Don't close the window, let the user close it manually
            // The blob URL will be cleaned up when the window is closed
          } 
          else if (contentType === "text/html") {
            // If it's HTML, display in the current window
            const htmlContent = await response.data.text();
            document.open();
            document.write(htmlContent);
            document.close();
          } 
          else if (contentType === "application/json") {
            // If JSON response, check for URL
            const text = await response.data.text();
            const jsonData = JSON.parse(text);
            if (jsonData.view_url) {
              // Redirect to the actual view URL
              window.location.href = jsonData.view_url;
            } else {
              throw new Error("Invalid response format");
            }
          } 
          else {
            throw new Error("Unsupported content type");
          }
        } 
        else if (action === "download") {
          // Download the invoice
          const response = await axios.get(
            `${API_BASE_URL}/api/invoices/download/${token}`,
            {
              responseType: "blob",
              headers: {
                Accept: "application/pdf",
              },
            }
          );

          // Create download link
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `invoice_${token.substring(0, 8)}.pdf`);
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
        setError(err.response?.data?.message || err.message || "Failed to load invoice. Please try again.");
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