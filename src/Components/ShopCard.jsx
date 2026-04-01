import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const slugify = (text) => {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const createProductSlug = (product) => {
  return `${slugify(product.title)}`;
};

// Convert HTML to plain text with basic formatting preserved
const htmlToPlainText = (html) => {
  if (!html) return "No description available";
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Replace <br> and block elements with spaces
  const blockElements = temp.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, br');
  blockElements.forEach(el => {
    if (el.tagName === 'BR') {
      el.replaceWith(' ');
    } else {
      el.appendChild(document.createTextNode(' '));
    }
  });
  
  // Get text content
  let text = temp.textContent || temp.innerText || '';
  
  // Clean up extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
};

// Truncate text
const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const ShopCard = ({ item, onAddToCart }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    navigate(`/product/${createProductSlug(item)}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddToCart(item);
  };

  const getPlaceholderImage = () => {
    const colors = ["FF6B6B", "4ECDC4", "45B7D1", "96CEB4", "FFEAA7"];
    const hash = (item.title || "")
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    const text = encodeURIComponent(item.title.substring(0, 20) || "Product");
    return `https://via.placeholder.com/300x300/${color}/FFFFFF?text=${text}`;
  };

  const imageUrl =
    imageError || !item.image ? getPlaceholderImage() : item.image;

  // Process description for card display
  const plainTextDescription = htmlToPlainText(item.description);
  const truncatedDescription = truncateText(plainTextDescription, 80);

  return (
    <div
      className="shop-card text-center"
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="shop-card-top">
        <img
          src={imageUrl}
          alt={item.title}
          className="img-fluid shop-card-image"
          onError={() => setImageError(true)}
        />

        <button
          type="button"
          className="shop-card-badge"
          onClick={handleAddClick}
          aria-label={`Add ${item.title} to cart`}
        >
          <FaPlus className="shop-card-badge-icon" />
        </button>
      </div>

      <div className="shop-card-bottom">
        <h4 className="shop-card-title">{item.title}</h4>
        <p className="shop-card-text">{truncatedDescription}</p>
        {item.price && (
          <p className="shop-card-price">${Number(item.price).toFixed(2)}</p>
        )}
      </div>
    </div>
  );
};

export default ShopCard;