export const TokenPoolABI = [
    // Read Functions
    "function isSupported(address token) external view returns (bool)",
    "function calculateFee(uint256 amount) external view returns (uint256)",
    "function estimateSendFee(uint16 _dstChainId, address _toAddress, uint256 _amount, bool _useZro, bytes calldata _adapterParams) external view returns (uint256 nativeFee, uint256 zroFee)",
    "function maxTransactionAmount() external view returns (uint256)",
    "function getTokenBalance(address token) external view returns (uint256)",
    "function isTrustedRemote(uint16 _srcChainId, bytes calldata _path) external view returns (bool)",
    "function paused() external view returns (bool)",
    
    // Write Functions
    "function sendTokens(uint16 _dstChainId, address _toAddress, address _token, uint256 _amount, address _refundAddress, address _zroPaymentAddress, bytes calldata _adapterParams) external payable",
    
    // Events
    "event TokensSent(address indexed token, address indexed from, address indexed to, uint256 amount, uint16 dstChainId)",
    "event TokensReceived(address indexed token, address indexed from, address indexed to, uint256 amount, uint16 srcChainId)"
  ];
  
  export const ERC20ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)"
  ];