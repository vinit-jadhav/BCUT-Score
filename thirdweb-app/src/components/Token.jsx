import React, { useState, useEffect } from "react";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const formatVolume = (number) => {
  if (!number) return "0";
  const num = parseFloat(number);
  if (num >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2) + "T";
  } else if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + "B";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + "K";
  } else {
    return num.toFixed(2);
  }
};

const getSafetyScoreStyles = (score) => {
  if (score >= 90) {
    return "text-green-800 bg-green-100";
  } else if (score >= 80) {
    return "text-yellow-800 bg-yellow-100";
  } else {
    return "text-red-800 bg-red-100";
  }
};

const Token = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChain, setSelectedChain] = useState("All Chains");
  const [sortConfig, setSortConfig] = useState({ key: "ranking", direction: "asc" });
  const navigate = useNavigate();

  const headers = [
    { text: "#", key: "ranking" },
    { text: "Asset", key: "asset" },
    { text: "Chain", key: "chain" },
    { text: "DeFi Score", key: "safetyScore" },
    { text: "Price", key: "price" },
    { text: "24hr Volume", key: "tradingVolume" }
  ];

  const getdata = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/Token`);
      if (res.data && Array.isArray(res.data)) {
        const initialTokens = res.data
          .filter(token => token.token_name && token.blockchain)
          .map((token) => ({
            id: token.token_address,
            ranking: token.ranking,
            asset: token.token_name,
            chain: token.blockchain,
            safetyScore: token.token_score ? parseFloat(token.token_score) : 0,
            price: token.current_price ? 
              parseFloat(token.current_price).toFixed(4) : "0.0000",
            tradingVolume: formatVolume(token.trading_volume),
            tradingVolumeValue: parseFloat(token.trading_volume) || 0,
            tokenAddress: token.token_address,
          }));
        setTokens(initialTokens);
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
      setError("Error fetching token data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getdata();
  }, []);

  const SkeletonRow = () => (
    <tr className="animate-pulse hover:bg-gray-800 transition-colors duration-200">
      {headers.map((_, i) => (
        <td key={i} className={`py-4 px-4 border border-gray-700 ${i < headers.length - 1 ? 'border-r' : ''}`}>
          <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
        </td>
      ))}
    </tr>
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedTokens = [...tokens].sort((a, b) => {
      if (key === "tradingVolume") {
        return direction === "asc" ? a.tradingVolumeValue - b.tradingVolumeValue : b.tradingVolumeValue - a.tradingVolumeValue;
      }
      if (["ranking", "safetyScore", "price"].includes(key)) {
        const aValue = parseFloat(a[key]) || 0;
        const bValue = parseFloat(b[key]) || 0;
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      const aValue = a[key]?.toString().toLowerCase() || "";
      const bValue = b[key]?.toString().toLowerCase() || "";
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    const updatedTokens = sortedTokens.map((token, index) => ({
      ...token,
      ranking: index + 1,
    }));

    setTokens(updatedTokens);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSortUp size={12} className="text-gray-400" />;
    return sortConfig.direction === "asc" ? 
      <FaSortUp size={12} className="text-gray-400" /> : 
      <FaSortDown size={12} className="text-gray-400" />;
  };

  const handleRowClick = (tokenId, blockchain) => {
    navigate(`/Token/${blockchain}/${tokenId}`);
  };

  const filteredTokens = tokens.filter((token) => {
    const matchesSearch = token.asset.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChain = selectedChain === "All Chains" || 
      token.chain.toLowerCase() === selectedChain.toLowerCase();
    return matchesSearch && matchesChain;
  });

  return (
    <div className="rounded-lg mx-auto p-6 min-h-[500px] dark:bg-gray-900 transition-colors duration-300" 
         style={{maxWidth:"1250px", marginTop: "100px", marginBottom: "200px" }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>

      <h5 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent 
        dark:from-blue-400 dark:to-purple-400 mb-6">
      <span className="text-white">Token Analytics</span> 
      </h5>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-64 p-3 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white
            focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          className="p-3 text-sm rounded-xl border border-gray-700 bg-gray-800 text-white
            focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="All Chains">All Chains</option>
          <option value="Ethereum">Ethereum</option>
          <option value="Polygon">Polygon</option>
          <option value="Avalanche">Avalanche</option>
          <option value="Linea">Linea</option>
        </select>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-lg border border-gray-700 max-h-[700px]">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={header.key}
                  className={`py-4 px-4 text-sm font-semibold text-gray-300 text-left border-b border-gray-700
                    ${index < headers.length - 1 ? 'border-r border-gray-700' : ''}
                    ${index === 0 ? 'rounded-tl-lg' : ''} 
                    ${index === headers.length - 1 ? 'rounded-tr-lg' : ''}`}
                >
                  <div 
                    className="flex items-center space-x-1 cursor-pointer"
                    onClick={() => header.key !== "ranking" && handleSort(header.key)}
                  >
                    <span>{header.text}</span>
                    {header.key !== "ranking" && getSortIcon(header.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <tr
                  key={token.id}
                  onClick={() => handleRowClick(token.id, token.chain)}
                  className="cursor-pointer transition-colors duration-200 hover:bg-gray-800 border-b border-gray-700"
                >
                  <td className="py-4 px-4 text-sm text-gray-300 border-r border-gray-700">{token.ranking}</td>
                  <td className="py-4 px-4 text-sm text-gray-100 font-medium border-r border-gray-700">{token.asset}</td>
                  <td className="py-4 px-4 text-sm text-gray-400 border-r border-gray-700">{token.chain}</td>
                  <td className="py-4 px-4 border-r border-gray-700">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                      ${getSafetyScoreStyles(Math.ceil(token.safetyScore))}`}>
                      {Math.ceil(token.safetyScore)}/100
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-green-400 border-r border-gray-700">${token.price}</td>
                  <td className="py-4 px-4 text-sm text-green-400">${token.tradingVolume}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="py-4 text-center text-gray-400">
                  No tokens found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Token;