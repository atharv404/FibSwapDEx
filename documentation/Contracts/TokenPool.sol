// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "./interfaces/IFeeManager.sol";

contract TokenPool is NonblockingLzApp, AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address public immutable SUPPORTED_TOKEN_1; // USDC
    address public immutable SUPPORTED_TOKEN_2; // USDT
    address public immutable feeManager;

    uint256 public maxTransactionAmount = 1000000 * 1e6; // 1M USDC/USDT
    mapping(address => uint256) public poolBalance;
    mapping(uint16 => mapping(bytes => bool)) public trustedRemoteAddresses;

    event LiquidityAdded(address token, uint256 amount);
    event LiquidityRemoved(address token, uint256 amount);
    event SwapInitiated(
        address token,
        uint256 amount,
        uint16 destinationChain,
        address recipient,
        uint256 fee
    );
    event SwapCompleted(
        address token,
        uint256 amount,
        address recipient
    );
    event MaxTransactionAmountUpdated(uint256 newAmount);
    event TrustedRemoteUpdated(uint16 chainId, address remote, bool trusted);
    event PoolBalanceMismatch(address token, uint256 expected, uint256 actual);

    error UnsupportedToken();
    error InvalidAmount();
    error InsufficientPoolBalance();
    error ZeroAddress();
    error InvalidChainId();
    error UntrustedRemote();
    error ContractPaused();
    error PoolBalanceError();

    modifier validateToken(address token) {
        if (token != SUPPORTED_TOKEN_1 && token != SUPPORTED_TOKEN_2) {
            revert UnsupportedToken();
        }
        _;
    }

    modifier validatePoolBalance(address token) {
        _;
        uint256 actualBalance = IERC20(token).balanceOf(address(this));
        if (actualBalance < poolBalance[token]) {
            emit PoolBalanceMismatch(token, poolBalance[token], actualBalance);
            revert PoolBalanceError();
        }
    }

    constructor(
        address _feeManager,
        address _endpoint,
        address _token1,
        address _token2
    ) NonblockingLzApp(_endpoint) {
        if (_feeManager == address(0) || _token1 == address(0) || _token2 == address(0)) {
            revert ZeroAddress();
        }
        
        feeManager = _feeManager;
        SUPPORTED_TOKEN_1 = _token1;
        SUPPORTED_TOKEN_2 = _token2;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function addLiquidity(address token, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRole(ADMIN_ROLE)
        validateToken(token)
        validatePoolBalance(token)
    {
        if (amount == 0) revert InvalidAmount();
        
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        
        uint256 actualAmount = balanceAfter - balanceBefore;
        poolBalance[token] += actualAmount;
        emit LiquidityAdded(token, actualAmount);
    }

    function removeLiquidity(address token, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRole(ADMIN_ROLE)
        validateToken(token)
        validatePoolBalance(token)
    {
        if (amount == 0) revert InvalidAmount();
        if (amount > poolBalance[token]) revert InsufficientPoolBalance();
        
        poolBalance[token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        emit LiquidityRemoved(token, amount);
    }

    function initiateSwap(
        address token,
        uint256 amount,
        uint16 destinationChain,
        address recipient
    ) external payable nonReentrant whenNotPaused validateToken(token) validatePoolBalance(token) {
        if (amount == 0 || amount > maxTransactionAmount) revert InvalidAmount();
        if (recipient == address(0)) revert ZeroAddress();
        
        uint256 fee = IFeeManager(feeManager).calculateFee(msg.sender, amount);
        uint256 totalAmount = amount + fee;
        
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        
        uint256 actualAmount = balanceAfter - balanceBefore;
        if (actualAmount < totalAmount) revert InvalidAmount();
        
        poolBalance[token] += actualAmount;
        
        IFeeManager(feeManager).processFee(token, fee);
        
        bytes memory payload = abi.encode(token, amount, recipient);
        _lzSend(
            destinationChain,
            payload,
            payable(msg.sender),
            address(0),
            bytes(""),
            msg.value
        );
        
        emit SwapInitiated(token, amount, destinationChain, recipient, fee);
    }

    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) internal virtual override whenNotPaused validatePoolBalance(address(0)) {
        if (!trustedRemoteAddresses[_srcChainId][_srcAddress]) {
            revert UntrustedRemote();
        }
        
        (address token, uint256 amount, address recipient) = abi.decode(
            _payload,
            (address, uint256, address)
        );
        
        if (!isSupported(token)) revert UnsupportedToken();
        if (amount > poolBalance[token]) revert InsufficientPoolBalance();
        
        poolBalance[token] -= amount;
        IERC20(token).safeTransfer(recipient, amount);
        
        emit SwapCompleted(token, amount, recipient);
    }

    function setTrustedRemote(
        uint16 chainId,
        address remote,
        bool trusted
    ) external onlyRole(ADMIN_ROLE) {
        if (chainId == 0) revert InvalidChainId();
        if (remote == address(0)) revert ZeroAddress();
        
        bytes memory remoteBytes = abi.encodePacked(remote);
        trustedRemoteAddresses[chainId][remoteBytes] = trusted;
        emit TrustedRemoteUpdated(chainId, remote, trusted);
    }

    function setMaxTransactionAmount(uint256 newAmount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (newAmount == 0) revert InvalidAmount();
        maxTransactionAmount = newAmount;
        emit MaxTransactionAmountUpdated(newAmount);
    }

    function togglePause() external onlyRole(ADMIN_ROLE) {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }

    function isSupported(address token) public view returns (bool) {
        return token == SUPPORTED_TOKEN_1 || token == SUPPORTED_TOKEN_2;
    }

    function getPoolBalance(address token) public view validateToken(token) returns (uint256) {
        return poolBalance[token];
    }

    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
        validateToken(token)
    {
        IERC20(token).safeTransfer(msg.sender, amount);
        emit LiquidityRemoved(token, amount);
    }
}