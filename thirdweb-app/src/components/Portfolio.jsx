import React, { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Portfolio = () => {
  const account = useActiveAccount();
  const address = account?.address || '';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBalance = async () => {
    if (!address) {
      setError('No wallet address connected');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/wallet-balance/${address}`);
      setData(response.data.data || []); // Ensure data is always an array
    } catch (err) {
      setError('Failed to fetch wallet balance');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (address) fetchBalance();
  }, [address]);

  const handleRowClick = (tokenAddress, blockchain) => {
    navigate(`/Token/${blockchain}/${tokenAddress}`);
  };

  // Ensure `data` is always an array before applying `filter` and `sort`
  const filteredData = (data || []).filter(item =>
    item.token_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.token_symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const valueA = parseFloat(a.quantity);
    const valueB = parseFloat(b.quantity);
    return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });

  const SkeletonRow = () => (
    <tr className="border-t border-gray-700">
      <td className="p-4 border-r border-gray-700">
        <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
      </td>
      <td className="p-4 border-r border-gray-700">
        <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
      </td>
      <td className="p-4 border-r border-gray-700">
        <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse"></div>
      </td>
      <td className="p-4">
        <div className="h-4 bg-gray-800 rounded w-1/4 animate-pulse"></div>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6" style={{ marginTop: "100px" }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Crypto Portfolio</h2>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search tokens..."
            className="w-full md:w-1/2 p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="w-full md:w-48 p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Low</option>
            <option value="desc">High</option>
          </select>
        </div>

        {error && (
          <div className="p-4 mb-4 text-red-500 bg-red-900/20 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-4 text-left font-medium border-r border-gray-700">Token</th>
                <th className="p-4 text-left font-medium border-r border-gray-700">Symbol</th>
                <th className="p-4 text-left font-medium border-r border-gray-700">Quantity</th>
                <th className="p-4 text-left font-medium">Network</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, index) => <SkeletonRow key={index} />)
              ) : sortedData.length > 0 ? (
                sortedData.map((token, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(token.token_address, token.blockchain)}
                    className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 border-r border-gray-700">{token.token_name}</td>
                    <td className="p-4 font-mono border-r border-gray-700">{token.token_symbol}</td>
                    <td className="p-4 border-r border-gray-700 text-green-400">
                      {parseFloat(token.quantity).toFixed(6)}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-gray-700 text-sm capitalize">
                        {token.blockchain}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No tokens in portfolio
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
