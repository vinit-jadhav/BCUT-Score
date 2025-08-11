import React, { useState, useEffect } from "react";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { sepolia } from "thirdweb/chains";
import { client } from "../client";
import { ethers } from "ethers";
import { getContract } from "thirdweb";
import { useSendTransaction, TransactionButton } from "thirdweb/react";

const contractaddress = import.meta.env.VITE_ADDRESS;

const contract = getContract({
  client: client,
  chain: sepolia,
  address: contractaddress,
});

const Subscription = () => {
  const { address } = useActiveAccount() || {}; // Handle case if address is undefined
  const [prices, setPrices] = useState({ week: 0, month: 0, year: 0 });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remainingTime, setRemainingTime] = useState({ days: 0, hours: 0, minutes: 0 });
  const [showSkeleton, setShowSkeleton] = useState(true); // For skeleton loader

  // Fetch subscription prices from the contract
  useEffect(() => {
    const fetchPrices = async () => {
      if (!address) return; // Only fetch if wallet is connected
      setShowSkeleton(true);

      setTimeout(async () => {
        try {
          const priceWeek = await readContract({
            contract,
            method: "function priceWeek() view returns (uint256)",
          });

          const priceMonth = await readContract({
            contract,
            method: "function priceMonth() view returns (uint256)",
          });

          const priceYear = await readContract({
            contract,
            method: "function priceYear() view returns (uint256)",
          });

          setPrices({
            week: ethers.formatEther(priceWeek),
            month: ethers.formatEther(priceMonth),
            year: ethers.formatEther(priceYear),
          });
        } catch (error) {
          console.error("Error fetching prices:", error);
        } finally {
          setShowSkeleton(false); // Stop showing skeleton after 0.5 seconds
        }
      }, 500); // 0.5 sec delay to simulate loading
    };

    fetchPrices();
  }, [address]); // Fetch only when wallet connects

  // Check if the user is already subscribed
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

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center py-10 px-4" style={{ marginTop: "150px", textAlign: "center" }}>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-12 mt-8 text-center">
        Choose Your Subscription Plan
      </h1>

      {showSkeleton ? (
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl w-full">
          {/* Skeleton Loader for Subscription Plans */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 text-gray-200 rounded-xl p-8 w-80 animate-pulse">
              <div className="bg-gray-600 h-8 w-2/3 mb-4 rounded"></div>
              <div className="bg-gray-600 h-10 w-1/2 mb-4 rounded"></div>
              <div className="bg-gray-600 h-6 w-3/4 mb-6 rounded"></div>
              <div className="bg-gray-600 h-10 w-full rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl w-full">
          {/* Weekly Plan */}
          <div className="bg-gray-800 border border-gray-700 text-gray-200 rounded-xl p-8 w-80 hover:scale-105 transition-all">
            <h2 className="text-2xl font-semibold mb-4">Weekly Plan</h2>
            <p className="text-3xl font-bold mb-2 text-blue-400">{prices.week} ETH</p>
            <p className="mb-6 text-gray-400">7 Days Full Access</p>
            {isSubscribed ? (
              <div className="text-gray-400 text-sm">
                <p className="text-green-400">Subscription Active</p>
                <p>{remainingTime.days}d {remainingTime.hours}h {remainingTime.minutes}m remaining</p>
              </div>
            ) : (
              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract,
                    method: "function subscribe(uint8 _option) payable",
                    params: [1], // Week Plan
                    value: BigInt(prices.week * 10 ** 18), // Convert ETH to wei
                  })
                }
                onTransactionConfirmed={async () => alert("Transaction Successful")}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#2563EB",
                  color: "white",
                  padding: "1rem 1rem",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
                Get Started
              </TransactionButton>
            )}
          </div>

          {/* Monthly Plan */}
          <div className="bg-gray-800 border border-gray-700 text-gray-200 rounded-xl p-8 w-80 hover:scale-105 transition-all">
            <h2 className="text-2xl font-semibold mb-4">Monthly Plan</h2>
            <p className="text-3xl font-bold mb-2 text-blue-400">{prices.month} ETH</p>
            <p className="mb-6 text-gray-400">30 Days Full Access</p>
            {isSubscribed ? (
              <div className="text-gray-400 text-sm">
                <p className="text-green-400">Subscription Active</p>
                <p>{remainingTime.days}d {remainingTime.hours}h {remainingTime.minutes}m remaining</p>
              </div>
            ) : (
              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract,
                    method: "function subscribe(uint8 _option) payable",
                    params: [2], // Month Plan
                    value: BigInt(prices.month * 10 ** 18), // Convert ETH to wei
                  })
                }
                onTransactionConfirmed={async () => alert("Transaction Successful")}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#2563EB",
                  color: "white",
                  padding: "1rem 1rem",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
               Most Popular
              </TransactionButton>
            )}
          </div>

          {/* Yearly Plan */}
          <div className="bg-gray-800 border border-gray-700 text-gray-200 rounded-xl p-8 w-80 hover:scale-105 transition-all">
            <h2 className="text-2xl font-semibold mb-4">Yearly Plan</h2>
            <p className="text-3xl font-bold mb-2 text-blue-400">{prices.year} ETH</p>
            <p className="mb-6 text-gray-400">365 Days Full Access</p>
            {isSubscribed ? (
              <div className="text-gray-400 text-sm">
                <p className="text-green-400">Subscription Active</p>
                <p>{remainingTime.days}d {remainingTime.hours}h {remainingTime.minutes}m remaining</p>
              </div>
            ) : (
              <TransactionButton
                transaction={() =>
                  prepareContractCall({
                    contract,
                    method: "function subscribe(uint8 _option) payable",
                    params: [3], // Year Plan
                    value: BigInt(prices.year * 10 ** 18), // Convert ETH to wei
                  })
                }
                onTransactionConfirmed={async () => alert("Transaction Successful")}
                style={{
                  marginTop: "1rem",
                  backgroundColor: "#2563EB",
                  color: "white",
                  padding: "1rem 1rem",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontSize: "15px"
                }}
              >
                     Best Value
              </TransactionButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
