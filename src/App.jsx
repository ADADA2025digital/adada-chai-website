import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./assets/styles/style.css";

// Layout
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ScrollToTop from "./Components/ScrollToTop.jsx";


// Pages
import Home from "./Pages/Home";
import AboutUs from "./Pages/AboutUs";
import Shop from "./Pages/Shop";
import ContactUs from "./Pages/ContactUs";
import Rent from "./Pages/Rent.jsx";
import Checkout from "./Pages/Checkout.jsx";


function App() {
  return (

      <div className="App">
         <ScrollToTop />  
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/rent" element={<Rent />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
        <Footer />
      </div>

  );
}

export default App;
