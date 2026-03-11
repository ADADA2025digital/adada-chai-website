import React from "react";

const FaqItem = ({ item, isOpen, onToggle }) => {
  return (
    <div className={`faq-item ${isOpen ? "active" : ""}`}>
      <button className="faq-question" onClick={onToggle} type="button">
        <span>{item.question}</span>
        <span className={`faq-arrow ${isOpen ? "open" : ""}`}></span>
      </button>

      <div className={`faq-answerWrapper ${isOpen ? "open" : ""}`}>
        <div className="faq-answer">
          {item.answer.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqItem;