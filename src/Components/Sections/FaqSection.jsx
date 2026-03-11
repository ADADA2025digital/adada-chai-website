import React, { useState } from "react";
import { motion } from "framer-motion";
import FaqItem from "../FaqItem.jsx";
import smicon from "../../assets/images/smicon.png";
import { faqData } from "../../Constant/data";

const FaqSection = () => {
  const [activeId, setActiveId] = useState(1);

  const handleToggle = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  const leftFaqs = faqData.filter((item) => item.column === "left");
  const rightFaqs = faqData.filter((item) => item.column === "right");

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="row">
        <div className="col-12 text-center">
          <div className="faq-topIcon">
            <img src={smicon} alt="Tea Icon" />
          </div>
          <h2 className="faq-title">FREQUENTLY ASKED QUESIONS</h2>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-6">
          <div className="faq-column">
            {leftFaqs.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={activeId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-6">
          <div className="faq-column">
            {rightFaqs.map((item) => (
              <FaqItem
                key={item.id}
                item={item}
                isOpen={activeId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FaqSection;