import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Token from "./components/Token";
import TokenDetails from "./components/TokenDetials";
import Pool from "./components/Pool";

import Subscription from "./components/Subscription";
import Footer from "./components/Footer";
import PoolDetails from "./components/PoolDetails";
import Portfolio from "./components/Portfolio";



export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Token" element={<Token />} />
        <Route path="/Pool" element={<Pool />} />
        <Route path="/Subscription" element={<Subscription/>} />
        <Route path="/Token/:blockchain/:tokenId" element={<TokenDetails />} /> {/* Dynamic route */}
        <Route path="/PoolDetails/:blockchain/:pairAddress" element={<PoolDetails />} />
        <Route path="/Portfolio" element={<Portfolio/>}/>
        
      </Routes>
<Footer/>
    </div>

   
  );
}
