import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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




const formatNumber = (num) => {
  if (!num) return '0.00';
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toLocaleString();
};

const FinancialNumber = ({ value, isCurrency = false }) => {
  if (value === null || value === undefined) return '--';
  
  const numericValue = parseFloat(value);
  const colorClass = numericValue >= 0 ? 'text-green-400' : 'text-red-400';
  const formatted = formatNumber(Math.abs(numericValue));
  const prefix = isCurrency ? '$' : '';

  return (
    <span className={`${colorClass} font-medium`}>
      {prefix}{formatted}
    </span>
  );
};

const PoolDetails = () => {
  
  const navigate = useNavigate();
  const { address } = useActiveAccount() || {};
  const { blockchain, pairAddress } = useParams();
  const [poolData, setPoolData] = useState(null);
  const [poolMetadata, setPoolMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [copiedToken0, setCopiedToken0] = useState(false);
  const [copiedToken1, setCopiedToken1] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showSkeleton, setShowSkeleton] = useState(true); // For skeleton loader

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        const [poolDataRes, poolMetadataRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/pooldetails/${blockchain}/${pairAddress}`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/poolmetadata/${blockchain}/${pairAddress}`)
        ]);
        setPoolData(poolDataRes.data);
        setPoolMetadata(poolMetadataRes.data);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Failed to fetch data");
      }
    };

    blockchain && pairAddress && fetchPoolData();
  }, [blockchain, pairAddress]);
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
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gray-900 text-gray-100 rounded-xl "
      style={{ marginTop: "9rem", marginBottom: "3rem", minHeight: "calc(100vh - 12rem)" }}>
      
      <div className="space-y-8 animate-pulse">
        {/* Protocol Header Skeleton */}
        <div className="text-center space-y-2">
          <div className="h-8 bg-gray-800 rounded w-1/4 mx-auto"></div>
        </div>

        {/* Main Pool Info Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Token Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/4"></div>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-gray-700/30 rounded">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-1"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>
                  <div className="p-2 bg-gray-700/30 rounded">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-1"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleCopy = (tokenIndex) => {
    const address = tokenIndex === 0 ? poolData.token0_address : poolData.token1_address;
    navigator.clipboard.writeText(address);
    tokenIndex === 0 ? setCopiedToken0(true) : setCopiedToken1(true);
    setTimeout(() => tokenIndex === 0 ? setCopiedToken0(false) : setCopiedToken1(false), 2000);
  };

  if (!poolData || !poolMetadata) return <SkeletonLoader />;

  return (
<>{isSubscribed ?(
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gray-900 text-gray-100 rounded-xl "
      style={{ marginTop: "9rem", marginBottom: "3rem", minHeight: "calc(100vh - 12rem)" }}>
      
      {error && <div className="text-center text-red-300 text-base p-3 bg-red-900/30 rounded-lg">{error}</div>}

      <div className="space-y-8">
        <div className="text-center space-y-2">
          <p className="text-2xl font-semibold text-gray-200">{poolMetadata.protocol?.charAt(0).toUpperCase() + poolMetadata.protocol?.slice(1)} Protocol</p>
        </div>

        {/* Main Pool Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base text-gray-400">Blockchain</span>
              <span className="text-base text-gray-300">{poolData.blockchain}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base text-gray-400">Pair Address</span>
              <span className="text-base text-gray-400 font-mono">
                {poolData.pairAddress.slice(0, 6)}...{poolData.pairAddress.slice(-4)}
              </span>
            </div>
          </div>

          {/* Total Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
              <p className="text-sm text-gray-400 mb-1">Total TVL</p>
              <p className="text-base">
                <FinancialNumber value={poolData.total_tvl} isCurrency />
              </p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
              <p className="text-sm text-gray-400 mb-1">24h Volume</p>
              <p className="text-base">
                <FinancialNumber value={poolData.volume_24hrs} isCurrency />
              </p>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
              <p className="text-sm text-gray-400 mb-1">24h TXs</p>
              <p className="text-base">
                <FinancialNumber value={poolData.transactions_24hrs} />
              </p>
            </div>
          </div>
        </div>

        {/* Token Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((index) => (
            <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-gray-200">
                  {index === 0 ? poolMetadata.token0_symbol : poolMetadata.token1_symbol}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="text-base">
                    <FinancialNumber 
                      value={index === 0 ? poolData.token0_price : poolData.token1_price} 
                      isCurrency 
                    />
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Address</span>
                  <button
                    onClick={() => handleCopy(index)}
                    className="text-sm text-gray-300 hover:text-gray-100 transition-colors flex items-center"
                  >
                    <span className="font-mono">
                      {index === 0 
                        ? `${poolData.token0_address.slice(0, 6)}...${poolData.token0_address.slice(-4)}`
                        : `${poolData.token1_address.slice(0, 6)}...${poolData.token1_address.slice(-4)}`}
                    </span>
                    {copiedToken0 && index === 0 && <span className="ml-2 text-green-400 text-sm">✓</span>}
                    {copiedToken1 && index === 1 && <span className="ml-2 text-green-400 text-sm">✓</span>}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-gray-700/30 rounded">
                    <p className="text-sm text-gray-400 mb-1">Reserve</p>
                    <p className="text-base">
                      <FinancialNumber 
                        value={index === 0 ? poolData.token0_reserve : poolData.token1_reserve} 
                        isCurrency 
                      />
                    </p>
                  </div>
                  <div className="text-center p-2 bg-gray-700/30 rounded">
                    <p className="text-sm text-gray-400 mb-1">TVL</p>
                    <p className="text-base">
                      <FinancialNumber 
                        value={index === 0 ? poolData.token0_tvl : poolData.token1_tvl} 
                        isCurrency 
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

export default PoolDetails;