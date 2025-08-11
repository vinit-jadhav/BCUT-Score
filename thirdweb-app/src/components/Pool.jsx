import React, { useState, useEffect } from "react";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Pool = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChain, setSelectedChain] = useState("All Chains");
  const [sortConfig, setSortConfig] = useState({ key: "rank", direction: "asc" });
  const navigate = useNavigate();

  const headers = [
    { text: "#", key: "rank" },
    { text: "Pool", key: "pool" },
    { text: "Chain", key: "blockchain" },
    { text: "Protocol", key: "protocol" },
    { text: "Token 0", key: "token0_symbol" },
    { text: "Token 1", key: "token1_symbol" }
  ];

  const getPools = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/pool`);
      if (res.data && Array.isArray(res.data)) {
        const processedPools = res.data
          .map((pool) => ({
            ...pool,
            id: pool.pair_address,
            blockchain: pool.blockchain?.charAt(0).toUpperCase() + pool.blockchain?.slice(1) || 'Unknown',
            pool: pool.pool || `${pool.token0_symbol || 'Token0'}/${pool.token1_symbol || 'Token1'}`,
            token0_symbol: pool.token0_symbol || 'Unknown',
            token1_symbol: pool.token1_symbol || 'Unknown',
            protocol: pool.protocol || 'Unknown',
            rank:pool.rank,
          }))
          .filter(pool => pool.pair_address); // Ensure we have a valid address

        console.log('Processed pools:', processedPools);
        setPools(processedPools);
      }
    } catch (error) {
      console.error("Error fetching pool data:", error);
      setError("Error fetching pool data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPools();
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sortedPools = [...pools].sort((a, b) => {
      const aValue = a[key]?.toString().toLowerCase() || "";
      const bValue = b[key]?.toString().toLowerCase() || "";
      
      if (key === "rank") return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
      return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    setPools(sortedPools);
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSortUp size={12} className="text-gray-400" />;
    return sortConfig.direction === "asc" ? 
      <FaSortUp size={12} className="text-gray-400" /> : 
      <FaSortDown size={12} className="text-gray-400" />;
  };

  const handlePoolClick = (pool) => {
    navigate(`/pooldetails/${pool.blockchain.toLowerCase()}/${pool.pair_address}`);
  };

  const filteredPools = pools.filter((pool) => {
    const searchMatch = 
      pool.pool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.token0_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pool.token1_symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const chainMatch = selectedChain === "All Chains" || 
                      pool.blockchain.toLowerCase() === selectedChain.toLowerCase();
    
    return searchMatch && chainMatch;
  });

  const SkeletonRow = () => (
    <tr className="animate-pulse hover:bg-gray-800 transition-colors duration-200">
      {headers.map((_, i) => (
        <td key={i} className={`py-4 px-4 border border-gray-700 ${i < headers.length - 1 ? 'border-r' : ''}`}>
          <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="rounded-lg mx-auto p-6 min-h-[500px] dark:bg-gray-900 transition-colors duration-300" 
         style={{maxWidth:"1250px", marginTop: "100px", marginBottom: "200px" }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
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
        <span className="text-white">DeFi Pool Analytics</span> 
      </h5>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search pools..."
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
                    onClick={() => handleSort(header.key)}
                  >
                    <span>{header.text}</span>
                    {header.key !== "rank" && getSortIcon(header.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : filteredPools.length > 0 ? (
              filteredPools.map((pool) => (
                <tr
                  key={pool.id}
                  onClick={() => handlePoolClick(pool)}
                  className="cursor-pointer transition-colors duration-200 hover:bg-gray-800 border-b border-gray-700"
                >
                  <td className="py-4 px-4 text-sm text-gray-300 border-r border-gray-700">{pool.rank}</td>
                  <td className="py-4 px-4 text-sm text-gray-100 font-medium border-r border-gray-700">
                    {pool.pool}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-400 border-r border-gray-700">{pool.blockchain}</td>
                  <td className="py-4 px-4 text-sm text-gray-400 border-r border-gray-700">{pool.protocol}</td>
                  <td className="py-4 px-4 text-sm text-white border-r border-gray-700">{pool.token0_symbol}</td>
                  <td className="py-4 px-4 text-sm text-white">{pool.token1_symbol}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="py-4 text-center text-gray-400">
                  No pools found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pool;