import express from "express";
import cors from "cors";
import unleashnfts from '@api/unleashnfts';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());

unleashnfts.auth(process.env.UNLEASHNFTS);

app.listen(process.env.PORT, () => console.log("Server is running on port 8080"));

app.get("/Token", async (req, res) => {
  const tokenAddresses = {
    ethereum: [
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
      '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
      '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
      '0x6982508145454ce325ddbe47a25d4ec3d2311933', // PEPE
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'  // WETH
    ],
    polygon: [
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
      '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
      '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
      '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
      '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39'  // LINK
    ],
    avalanche: [
      '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC
      '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT
      '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB', // WETH
      '0x152b9d0FdC40C096757F570A51E494bd4b943E50', // BTC.b
      '0x5947BB275c521040051D82396192181b413227A3'  // LINK
    ],
    linea: [
      '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // USDC
      '0xA219439258ca9da29E9Cc4cE5596924745e12B93', // USDT
      '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', // WETH
      '0x3aAB2285ddcD957DfAB6B943F1592725A2036ED6', // WBTC
      '0x3B2e6CbE6bDE6aB4E34723f3A2C58eE0eA6F950b'  // LINK
    ]
  };

  try {
    const promises = [];
    
    Object.entries(tokenAddresses).forEach(([blockchain, addresses]) => {
      addresses.forEach((address) => {
        promises.push(
          unleashnfts.getTokenMetrics({
            blockchain: blockchain,
            token_address: address,
            offset: '0',
            limit: '1'
          }).catch(err => {
            console.error(`Error fetching ${blockchain} token ${address}:`, err);
            return null; // Handle individual errors
          })
        );
      });
    });

    const responses = await Promise.all(promises);
    
    const tokens = responses
      .map((response, index) => {
        if (!response || !response.data || !response.data.data) return null;
        const tokenData = response.data.data[0];
        
        return {
          ranking: index + 1,
          token_symbol: tokenData.token_symbol || 'N/A',
          token_name: tokenData.token_name || 'Unknown Token',
          blockchain: tokenData.blockchain ? 
            tokenData.blockchain.charAt(0).toUpperCase() + tokenData.blockchain.slice(1) : 'Unknown',
          current_price: tokenData.current_price || 0,
          token_score: tokenData.token_score || 0,
          trading_volume: tokenData['24hr_trading_volume'] || 0,
          token_address: tokenData.token_address || 'N/A'
        };
      })
      .filter(token => token !== null);

    res.send(tokens);
  } catch (err) {
    console.error("Global API error:", err);
    res.status(500).send({ error: "Failed to fetch token data" });
  }
});
app.get("/Token/:blockchain/:tokenId", (req, res) => {
    const { blockchain, tokenId } = req.params;
  
    // Validate blockchain input
    const validBlockchains = ['ethereum', 'polygon', 'avalanche', 'linea'];
    if (!validBlockchains.includes(blockchain.toLowerCase())) {
      return res.status(400).send({ error: "Invalid blockchain" });
    }


  
    // Fetch data for the token based on blockchain and tokenId
    unleashnfts.getTokenMetrics({
      blockchain: blockchain.toLowerCase(),
      token_address: tokenId,
      offset: '0',
      limit: 1
    })
      .then(response => {
        const tokenData = response.data.data[0];
        if (tokenData) {
          const tradingVolume24hr = tokenData['24hr_trading_volume'];
          const tokenInfo = {
            token_symbol: tokenData.token_symbol,
            token_name: tokenData.token_name,
            blockchain: tokenData.blockchain,
            current_price: tokenData.current_price,
            token_score: tokenData.token_score,
            trading_volume: tradingVolume24hr,
            token_address: tokenData.token_address,
            total_supply:tokenData.total_supply,
            market_cap:tokenData.market_cap,
            all_trading_volume:tokenData.all_trading_volume,
            circulating_supply:tokenData.circulating_supply,
            fully_diluted_valuation:tokenData.fully_diluted_valuation,
            profitable_trade_score:tokenData.profitable_trade_score,
            all_time_high:tokenData.all_time_high,
            all_time_low:tokenData.all_time_low,
            traders_score:tokenData.traders_score,
            trading_pattern_score:tokenData.trading_pattern_score,
            lp_stability_score:tokenData.lp_stability_score,
            holders:tokenData.holders
          };

          res.send(tokenInfo);
    
        } else {
          res.status(404).send({ error: "Token not found" });
        }
      })
      .catch(err => {
        console.error("Error fetching token metrics:", err);
        res.status(500).send({ error: "Failed to fetch data" });
      });
  });
  app.get("/pooldetails/:blockchain/:pairAddress", async (req, res) => {
    const { blockchain, pairAddress } = req.params;
  
    // Validate blockchain input
    const validBlockchains = ['ethereum', 'polygon', 'avalanche', 'bsc'];
    const chain = blockchain.toLowerCase();
  
    if (!validBlockchains.includes(chain)) {
      return res.status(400).json({ error: "Invalid blockchain" });
    }
  
    try {
      // Fetch pool data from unleashnfts API
      const { data } = await unleashnfts.getDefiPoolMetrics({
        blockchain: chain,
        pair_address: pairAddress.toLowerCase(),
        offset: '0',
        limit: '1'
      });
      
  
      if (!data || !data.data || data.data.length === 0) {
        return res.status(404).json({ error: "Pool data not found" });
      }
  
      const poolData = data.data[0];
      const poolInfo = {
        blockchain: poolData.blockchain,
        pairAddress: poolData.pair_address,
        protocol: poolData.protocol,
        token0_address: poolData.token0,
        token0_price: poolData.token0_price,
        token0_reserve: poolData.token0_reserve,
        token0_share: poolData.token0_share,
        token0_tvl: poolData.token0_tvl,
        token1_address: poolData.token1,
        token1_price: poolData.token1_price,
        token1_reserve: poolData.token1_reserve,
        token1_share: poolData.token1_share,
        token1_tvl: poolData.token1_tvl,
        total_tvl: poolData.total_tvl,
        transactions_24hrs: poolData.transactions_24hrs,
        transactions_24hrs_change: poolData.transactions_24hrs_change,
        transactions_7d: poolData.transactions_7d,
        transactions_7d_change: poolData.transactions_7d_change,
        transactions_30d: poolData.transactions_30d,
        transactions_30d_change: poolData.transactions_30d_change,
        transactions_90d: poolData.transactions_90d,
        transactions_90d_change: poolData.transactions_90d_change,
        transactions_all: poolData.transactions_all,
        volume_24hrs: poolData.volume_24hrs,
        volume_24hrs_change: poolData.volume_24hrs_change,
        volume_7d: poolData.volume_7d,
        volume_7d_change: poolData.volume_7d_change,
        volume_30d: poolData.volume_30d,
        volume_30d_change: poolData.volume_30d_change,
        volume_90d: poolData.volume_90d,
        volume_90d_change: poolData.volume_90d_change,
        volume_all: poolData.volume_all,

      };
  
      // Combine both objects and send as response
      res.json(
        poolInfo);
    } catch (err) {
      console.error("Error fetching pool details:", err);
      res.status(500).json({ error: "Failed to fetch pool data" });
    }
  });
  

  app.get("/poolmetadata/:blockchain/:pairAddress", async (req, res) => {
    const { blockchain, pairAddress } = req.params;
  
    // Validate blockchain input
    const validBlockchains = ['ethereum', 'polygon', 'avalanche', 'bsc'];
    const chain = blockchain.toLowerCase();
  
    if (!validBlockchains.includes(chain)) {
      return res.status(400).json({ error: "Invalid blockchain" });
    }
  
    try {
      // Fetch pool metadata from unleashnfts API
      const { data } = await unleashnfts.getDefiPoolMetadata({
        blockchain: chain,
        pair_address: pairAddress.toLowerCase(),
        offset: '0',
        limit: '30'
      });
  
      if (!data || !data.data || data.data.length === 0) {
        return res.status(404).json({ error: "Pool metadata not found" });
      }
  
      const poolMetadata = data.data[0];
  
      // Pool metadata with flattened structure
      const poolInfo = {
        blockchain: poolMetadata.blockchain,
        chain_id: poolMetadata.chain_id,
        deployed_date: poolMetadata.deployed_date,
        deployer: poolMetadata.deployer,
        pair_address: poolMetadata.pair_address,
        pool: poolMetadata.pool,
        protocol: poolMetadata.protocol,
        token0_address: poolMetadata.token0,
        token0_decimal: poolMetadata.token0_decimal,
        token0_name: poolMetadata.token0_name,
        token0_symbol: poolMetadata.token0_symbol,
        token1_address: poolMetadata.token1,
        token1_decimal: poolMetadata.token1_decimal,
        token1_name: poolMetadata.token1_name,
        token1_symbol: poolMetadata.token1_symbol
      };
  
      // Send the flattened pool information
      res.json(poolInfo);
    } catch (err) {
      console.error("Error fetching pool metadata:", err);
      res.status(500).json({ error: "Failed to fetch pool metadata" });
    }
  });
  
// Backend (server.js)
app.get("/pool", async (req, res) => {
  const poolAddresses = {
    ethereum: [
      '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
      '0xd3d2e2692501a5c9ca623199d38826e513033a17',
      '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
      '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
      '0x5c6Ee304399DBdB9C8Ef030aB642B10820DB8F56',
      '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      '0x795065dcc9f64b5614c407a6efdc400da6221fb0',
      '0x43ae24960e5534731fc831386c07755a2dc33d47',
    ],
    polygon: [
      '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
      '0x9ceff2f5138fC59eB925D270b8A7A9C02b4eBB15',
      '0x34915F9b8f1bA078Aac12CdfD6C2fE81f6E05845',
      '0xaaE10Fa31E73287687ce56eC90f81A800361B898',
      '0x576cf361711cd940cd9c397bb98c4c896cbd38de',
      '0x4f1694a02f2c6f26f1549b531c48bf8a57a8fdd1',
      '0x853ee4b2a13f8a742d64c8f088be7ba2131f670d',
      '0xc4e595ac3201e3ed7c5aab9f8986df3b3ff297ff',
      '0xa374094527e1673a86de625aa59517c5de346d32',
      '0x2cF7252e74036d1Da831d11089D326296e64a728',
    ],
    avalanche: [
      '0x9ee0a4e21bd333a6bb2ab298194320b8daa26516',
      '0xA389f9430876455C36478DeEa9769B7Ca4E3DDB1',
    ],
    linea: [
      '0x176211869ca2b568f2a7d4ee941e073a821ee1ff',
    ]
  };

  try {
    const allPools = [];

    // Fetch all pools first
    const fetchPromises = Object.entries(poolAddresses).map(([chain, addresses]) => 
      Promise.all(addresses.map(async (address) => {
        try {
          const response = await unleashnfts.getDefiPoolMetadata({
            blockchain: chain,
            pair_address: address,
            offset: '0',
            limit: '1'
          });

          return response?.data?.data?.[0] ? {
            ...response.data.data[0],
            blockchain: chain,
            pair_address: address
          } : null;
        } catch (error) {
          console.error(`Error fetching ${chain} pool ${address}:`, error.message);
          return null;
        }
      }))
    );

    // Wait for all chains to complete
    const chainResults = await Promise.all(fetchPromises);
    
    // Flatten and filter results
    chainResults.forEach(chainPools => {
      allPools.push(...chainPools.filter(pool => pool !== null));
    });

    // Add ranking after all pools are collected
    const rankedPools = allPools.map((pool, index) => ({
      ...pool,
      rank: index + 1
    }));

    // console.log(`Successfully processed ${rankedPools.length} pools`);
    res.send(rankedPools);

  } catch (error) {
    console.error("Global error:", error);
    res.status(500).send({
      error: "Failed to fetch pool data",
      details: error.message
    });
  }
});
  app.get('/api/wallet-balance/:address', async (req, res) => {
    const { address } = req.params;
  
    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
  
    try {
      const response = await unleashnfts.getWalletBalanceToken({
        address: address,
        blockchain: 'full',
        time_range: 'all',
        offset: '0',
        limit: '30'
      });
  
      res.json(response.data);  // Send API response to frontend
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
  });
