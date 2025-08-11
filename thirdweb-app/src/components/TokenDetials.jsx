import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./TokenDetials.css";

import { readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { client } from "../client";
import { useNavigate } from 'react-router-dom';
import { getContract } from "thirdweb";
const contractaddress = import.meta.env.VITE_ADDRESS;
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
const contract = getContract({
  client: client,
  chain: sepolia,
  address: contractaddress,
});

const formatLargeNumber = (number) => {
  if (!number && number !== 0) return "N/A";
  if (number >= 1_000_000_000_000) return (number / 1_000_000_000_000).toFixed(2) + "T";
  if (number >= 1_000_000_000) return (number / 1_000_000_000).toFixed(2) + "B";
  if (number >= 1_000_000) return (number / 1_000_000).toFixed(2) + "M";
  if (number >= 1_000) return (number / 1_000).toFixed(2) + "K";
  return number.toString();
};

const TokenDetails = () => {
  const navigate = useNavigate();
  const { address } = useActiveAccount() || {};
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0 });
  const { blockchain, tokenId } = useParams();
  const [tokenDetails, setTokenDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [profitableTradeScore, setProfitableTradeScore] = useState(0);
  const [tradingPatternScore, setTradingPatternScore] = useState(0);
  const [lpStabilityScore, setLpStabilityScore] = useState(0);

  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/Token/${blockchain}/${tokenId}`);
        const data = res.data;

        const validatedData = {
          token_name: data.token_name || "Unknown",
          token_symbol: data.token_symbol || "N/A",
          trading_volume: data.trading_volume || 0,
          current_price: data.current_price || 0,
          market_cap: data.market_cap || 0,
          circulating_supply: data.circulating_supply || 0,
          fully_diluted_valuation: data.fully_diluted_valuation || 0,
          total_supply: data.total_supply || 0,
          token_score: data.token_score || 0,
          token_address: data.token_address || "0x0000000000000000000000000000000000000000",
          blockchain: data.blockchain || "Unknown",
          profitable_trade_score: data.profitable_trade_score || 0,
          all_time_high: data.all_time_high || 0,
          all_time_low: data.all_time_low || 0,
          lp_stability_score: data.lp_stability_score || 0,
          trading_pattern_score: data.trading_pattern_score || 0,
          holders:data.holders || 0
        };

        setTokenDetails(validatedData);

        // Animation intervals
        const intervals = [];
        const animate = (setter, target, multiplier = 1) => {
          let current = 0;
          const targetValue = target * multiplier;
          const interval = setInterval(() => {
            if (current >= targetValue) clearInterval(interval);
            else {
              current += Math.ceil(targetValue / 50);
              setter(Math.min(current, targetValue));
            }
          }, 30);
          intervals.push(interval);
        };

        animate(setDisplayScore, validatedData.token_score);
        animate(setProfitableTradeScore, validatedData.profitable_trade_score, 20);
        animate(setTradingPatternScore, validatedData.trading_pattern_score, 20);
        animate(setLpStabilityScore, validatedData.lp_stability_score, 20);

        return () => intervals.forEach(clearInterval);

      } catch (error) {
        setError("Error fetching token details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTokenDetails();
  }, [blockchain, tokenId]);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!address) return;
      try {
        const data = await readContract({
          contract,
          method: "function isSubscribed(address _user) view returns (bool)",
          params: [address],
        });

        setIsSubscribed(data);
        
        // Fetch subscription end time and calculate remaining time
        if (data) {
          const subscriptionEndTime = await readContract({
            contract,
            method: "function subscriptions(address) view returns (uint256)",
            params: [address],
          });
        
          const endTime = subscriptionEndTime.toString(); // Convert BigNumber to string
          const remainingMilliseconds = parseInt(endTime) * 1000 - Date.now(); // Convert to milliseconds
          
          const daysRemaining = Math.floor(remainingMilliseconds / (1000 * 60 * 60 * 24));
          const hoursRemaining = Math.floor((remainingMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutesRemaining = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

          setRemainingTime({
            days: daysRemaining,
            hours: hoursRemaining,
            minutes: minutesRemaining,
          });
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };

    checkSubscriptionStatus();
  }, [address]);


  const SkeletonLoader = () => (
    <div className="token-details mt-20 text-gray-400">
      <div className="token-details-container bg-gray-800 rounded-lg border border-gray-700 animate-pulse">
        <div className="left-section">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>

        <div className="right-section flex flex-col items-center">
          <div className="w-40 h-40 mb-4 bg-gray-700 rounded-full"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      </div>

      <div className="Analysis">
        <div className="Analysis-left bg-gray-800 rounded-lg border border-gray-700 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="mb-4">
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          </div>
          
          <div className="score-container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-lg" style={{border:"1px solid #2f384e"}}>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3 mt-2"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="Analysis-right bg-gray-800 rounded-lg border border-gray-700 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="Analysis-right-p3 flex gap-2">
              <div className="Analysis-right-inner w-full h-16 bg-gray-700 rounded-md"></div>
              <div className="Analysis-right-inner w-full h-16 bg-gray-700 rounded-md"></div>
            </div>
            <div className="Analysis-right-p1 flex gap-2">
              <div className="Analysis-right-inner w-full h-16 bg-gray-700 rounded-md"></div>
              <div className="Analysis-right-inner w-full h-16 bg-gray-700 rounded-md"></div>
            </div>
            <div className="Analysis-right-p2 flex gap-2">
              <div className="Analysis-right-inner w-full h-16 bg-gray-700 rounded-md"></div>
              <div className="Analysis-right-inner w-full h-16 bg-gray-700 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleCopy = () => {
    if (tokenDetails) {
      navigator.clipboard.writeText(tokenDetails.token_address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#4CAF50";
    if (score >= 80) return "#FF9800";
    return "#F44336";
  };

  if (loading) return <SkeletonLoader />;

  return (

    <>{isSubscribed ?(
    <div className="token-details mt-20 text-gray-400">
      {error && <p className="error-message text-red-500 text-center">{error}</p>}

      {tokenDetails && (
        <>
          <div className="token-details-container bg-gray-800 rounded-lg border border-gray-700">
            <div className="left-section">
              <h1 className="text-md font-bold mb-4 text-white" style={{color:"white"}}>{tokenDetails.token_name}</h1>
              <p className="text-md">Symbol: {tokenDetails.token_symbol}</p>
              <p className="text-md">Blockchain: {tokenDetails.blockchain}</p>
              <p>
                Address:{" "}
                <span onClick={handleCopy} className="cursor-pointer text-white text-sm p-1 rounded">
                  {tokenDetails.token_address.slice(0, 6)}...{tokenDetails.token_address.slice(-4)}
                </span>
                {copied &&<span className="ml-2 text-green-400 text-sm">✓</span>}
              </p>
              <p className="text-md">24hr Trading Volume: <span className="text-green-400">${formatLargeNumber(tokenDetails.trading_volume)}</span> </p>
              <p className="text-md">Price: <span className="text-green-400">${formatLargeNumber(tokenDetails.current_price)}</span></p>
            </div>

            <div className="right-section flex flex-col items-center">
              <div className="token-score-container w-40 h-40 mb-4">
                <CircularProgressbar
                  value={displayScore}
                  maxValue={100}
                  text={`${Math.ceil(displayScore)}`}
                  styles={buildStyles({
                    pathColor: getScoreColor(displayScore),
                    textColor: getScoreColor(displayScore),
                    trailColor: "#374151",
                    textSize: "18px",
                  })}
                />
              </div>
              <p className="text-lg text-white">DeFi Score</p>
            </div>
          </div>

          <div className="Analysis">
            <div className="Analysis-left bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Token Analysis</h2>
              <div className="mb-4">
                <p className="text-sm font-medium">
                  All Time High: <span className="text-green-400">${formatLargeNumber(tokenDetails.all_time_high)}</span>
                </p>
                <p className="text-sm font-medium">
                  All Time Low: <span className="text-green-400">${formatLargeNumber(tokenDetails.all_time_low)}</span>
                </p>
                <p className="text-sm font-medium">Total Holders: <span style={{color:"white"}}>{tokenDetails.holders}</span> </p>
              </div>

              <div className="score-container grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col items-center p-4 rounded-lg border border-gray-700">
                  <p className="text-sm mb-2">Profitable Trade</p>
                  <div className="w-20 h-20">
                    <CircularProgressbar
                      value={profitableTradeScore}
                      text={`${Math.ceil(profitableTradeScore / 20)}`}
                      styles={buildStyles({
                        pathColor: getScoreColor(profitableTradeScore),
                        textColor: getScoreColor(profitableTradeScore),
                        trailColor: "#374151",
                        textSize: "25px",
                      })}
                    />
                  </div>
                  <p className="text-sm text-center mt-2">Score</p>
                </div>

                <div className="flex flex-col items-center p-4 rounded-lg border border-gray-700">
                  <p className="text-sm mb-2">Trading Pattern</p>
                  <div className="w-20 h-20">
                    <CircularProgressbar
                      value={tradingPatternScore}
                      text={`${Math.ceil(tradingPatternScore / 20)}`}
                      styles={buildStyles({
                        pathColor: getScoreColor(tradingPatternScore),
                        textColor: getScoreColor(tradingPatternScore),
                        trailColor: "#374151",
                        textSize: "25px",
                      })}
                    />
                  </div>
                  <p className="text-sm text-center mt-2">Score</p>
                </div>

                <div className="flex flex-col items-center p-4 rounded-lg border border-gray-700">
                  <p className="text-sm mb-2">LP Stability</p>
                  <div className="w-20 h-20">
                    <CircularProgressbar
                      value={lpStabilityScore}
                      text={`${Math.ceil(lpStabilityScore / 20)}`}
                      styles={buildStyles({
                        pathColor: getScoreColor(lpStabilityScore),
                        textColor: getScoreColor(lpStabilityScore),
                        trailColor: "#374151",
                        textSize: "25px",
                      })}
                    />
                  </div>
                  <p className="text-sm text-center mt-2">Score</p>
                </div>
              </div>
            </div>

            <div className="Analysis-right bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Token Metrics</h3>
              <div className="space-y-4">
                <div className="Analysis-right-p3 flex gap-2">
                  <div className="Analysis-right-inner p-4 border border-gray-700 rounded-md">
                    <p className="header">Price</p>
                    <p className="text-green-400">${formatLargeNumber(tokenDetails.current_price)}</p>
                  </div>
                  <div className="Analysis-right-inner p-4 border border-gray-700 rounded-md">
                    <p className="header">Trading Volume</p>
                    <p className="text-green-400">${formatLargeNumber(tokenDetails.trading_volume)}</p>
                  </div>
                </div>

                <div className="Analysis-right-p1 flex gap-2">
                  <div className="Analysis-right-inner p-4 border border-gray-700 rounded-md">
                    <p className="header">Market Cap</p>
                    <p className="text-green-400">${formatLargeNumber(tokenDetails.market_cap)}</p>
                  </div>
                  <div className="Analysis-right-inner p-4 border border-gray-700 rounded-md">
                    <p className="header">Circulating Supply</p>
                    <p className="text-white">{formatLargeNumber(tokenDetails.circulating_supply)}</p>
                  </div>
                </div>

                <div className="Analysis-right-p2 flex gap-2">
                  <div className="Analysis-right-inner p-4 border border-gray-700 rounded-md">
                    <p className="header">FDV</p>
                    <p className="text-green-400">${formatLargeNumber(tokenDetails.fully_diluted_valuation)}</p>
                  </div>
                  <div className="Analysis-right-inner p-4 border border-gray-700 rounded-md">
                    <p className="header">Total Supply</p>
                    <p className="text-white">{formatLargeNumber(tokenDetails.total_supply)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
     ):(  <div style={{ display: 'flex' , justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <button
        onClick={() => navigate('/subscription')} // Inline function for navigation
     
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg w-30"
      >
 <AiOutlineEyeInvisible size={25} color="white" />
      </button>

      <br />
      
    </div>)}</>
  );
};

export default TokenDetails;