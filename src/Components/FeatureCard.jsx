import React from "react";

const FeatureCard = ({ data }) => {
  // Basic sanitization without DOMPurify (removes script tags only)
  const sanitizeHTML = (html) => {
    if (!html) return "";
    // Remove script tags and dangerous attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/on\w+='[^']*'/g, '');
  };

  // Truncate text content while preserving HTML structure
  const truncateDescriptionWithHTML = (html) => {
    if (!html) return "";
    
    // Create temporary div to extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    if (textContent.length <= 45) return html;
    
    // Truncate at 45 characters
    const truncated = textContent.substring(0, 45) + "...";
    return truncated;
  };

  // Get title with fallback
  const getTitle = () => {
    if (data.title) return data.title;
    if (data.name) return data.name;
    if (data.product_name) return data.product_name;
    if (data.productTitle) return data.productTitle;
    return "Feature Title";
  };

  // Get description with fallback
  const getDescription = () => {
    if (data.description) return data.description;
    if (data.product_description) return data.product_description;
    if (data.desc) return data.desc;
    return "Feature description goes here";
  };

  // Get icon with fallback
  const getIcon = () => {
    return data.icon || data.image || smicon;
  };

  const fullDescription = getDescription();
  const truncatedDescription = truncateDescriptionWithHTML(fullDescription);

  return (
    <div className="feature-card">
      <div className="feature-card-inner">
        <div className="feature-icon">
          <img src={getIcon()} alt="feature" />
        </div>

        <h4>{getTitle()}</h4>

        <div 
          className="feature-description"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(truncatedDescription) }}
        />
      </div>

      <div className="feature-readmore">Read More →</div>
    </div>
  );
};

export default FeatureCard;