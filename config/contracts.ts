export const CONTRACTS = {
  // Fee Manager (Deployed on Polygon)
  feeManager: "0xB1e7A13eccacDF92C9267a4917bc66103bB4D6D6",
  
  // Token Pools
  tokenPool: {
    ethereum: "0xEe3aA54b931c5Fc0F986D3E7380809f16762A4a9",
    bsc: "0x629c475137D201B9b3500900a3ADf8268697442B",
    polygon: "0x94Ef82A7e76D07249af7314122F54a0568D7c11c"
  }
} as const

export const NETWORKS = {
  ethereum: {
    name: "Ethereum",
    chainId: 1,
    lzChainId: 101,
    tokens: {
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    }
  },
  bsc: {
    name: "BSC",
    chainId: 56,
    lzChainId: 102,
    tokens: {
      USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
    }
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    lzChainId: 109,
    tokens: {
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
    }
  }
} as const

