// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IFeeManager.sol";

contract FeeManager is IFeeManager, AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    uint256 public baseFee = 100; // 1% = 100
    uint256 public discountedFee = 50; // 0.5% = 50
    uint256 private constant FEE_DENOMINATOR = 10000;
    
    address public immutable FIBO_TOKEN;
    address public immutable ORIO_TOKEN;
    
    struct DiscountToken {
        bool isActive;
        uint256 minimumBalance;
    }
    
    mapping(address => DiscountToken) public discountTokens;
    mapping(address => uint256) public collectedFees;
    
    error InvalidFeeParameters();
    error InvalidDiscountToken();
    error InvalidAmount();
    error ZeroAddress();
    error InsufficientFeeBalance();
    error TransferFailed();
    error TokenNotActive();
    error BalanceCheckFailed();

    modifier validToken(address token) {
        if (token != FIBO_TOKEN && token != ORIO_TOKEN) revert InvalidDiscountToken();
        _;
    }

    constructor(address fiboToken, address orioToken) {
        if (fiboToken == address(0) || orioToken == address(0)) revert ZeroAddress();
        
        FIBO_TOKEN = fiboToken;
        ORIO_TOKEN = orioToken;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        discountTokens[FIBO_TOKEN] = DiscountToken({
            isActive: true,
            minimumBalance: 100000 * 10**18 // 100,000 FIBO
        });
        
        discountTokens[ORIO_TOKEN] = DiscountToken({
            isActive: true,
            minimumBalance: 10000000 * 10**18 // 10,000,000 ORIO
        });
    }

    function isEligibleForDiscount(address user) public view override returns (bool) {
        if (user == address(0)) revert ZeroAddress();

        uint256 fiboBalance;
        uint256 orioBalance;

        // Get FIBO balance safely
        try IERC20(FIBO_TOKEN).balanceOf(user) returns (uint256 balance) {
            fiboBalance = balance;
        } catch {
            fiboBalance = 0;
        }

        // Get ORIO balance safely
        try IERC20(ORIO_TOKEN).balanceOf(user) returns (uint256 balance) {
            orioBalance = balance;
        } catch {
            orioBalance = 0;
        }

        DiscountToken memory fiboDiscount = discountTokens[FIBO_TOKEN];
        DiscountToken memory orioDiscount = discountTokens[ORIO_TOKEN];

        return (fiboDiscount.isActive && fiboBalance >= fiboDiscount.minimumBalance) ||
               (orioDiscount.isActive && orioBalance >= orioDiscount.minimumBalance);
    }

    function checkAndEmitEligibility(address user) external returns (bool) {
        if (user == address(0)) revert ZeroAddress();

        uint256 fiboBalance;
        uint256 orioBalance;

        try IERC20(FIBO_TOKEN).balanceOf(user) returns (uint256 balance) {
            fiboBalance = balance;
        } catch {
            fiboBalance = 0;
        }

        try IERC20(ORIO_TOKEN).balanceOf(user) returns (uint256 balance) {
            orioBalance = balance;
        } catch {
            orioBalance = 0;
        }

        bool isEligible = isEligibleForDiscount(user);
        emit DiscountEligibilityChecked(user, isEligible, fiboBalance, orioBalance);
        return isEligible;
    }
    
    function calculateFee(
        address user,
        uint256 amount
    ) external view override returns (uint256) {
        if (amount == 0) revert InvalidAmount();
        if (user == address(0)) revert ZeroAddress();
        
        bool eligible;
        try this.isEligibleForDiscount(user) returns (bool _eligible) {
            eligible = _eligible;
        } catch {
            eligible = false;
        }
        
        uint256 feeRate = eligible ? discountedFee : baseFee;
        return (amount * feeRate) / FEE_DENOMINATOR;
    }
    
    function processFee(
        address token,
        uint256 amount
    ) external override nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        if (token == address(0)) revert ZeroAddress();
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        collectedFees[token] += amount;
        
        emit FeeCollected(token, amount);
    }
    
    function setFees(
        uint256 newBaseFee,
        uint256 newDiscountedFee
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        if (newBaseFee <= newDiscountedFee || newBaseFee > 1000) 
            revert InvalidFeeParameters();
        
        baseFee = newBaseFee;
        discountedFee = newDiscountedFee;
        
        emit FeesUpdated(newBaseFee, newDiscountedFee);
    }
    
    function updateDiscountTokenThreshold(
        address token,
        uint256 newThreshold
    ) external onlyRole(ADMIN_ROLE) whenNotPaused validToken(token) {
        if (!discountTokens[token].isActive) revert TokenNotActive();
        
        discountTokens[token].minimumBalance = newThreshold;
        emit DiscountTokenUpdated(token, newThreshold);
    }
    
    function setDiscountTokenStatus(
        address token,
        bool isActive
    ) external onlyRole(ADMIN_ROLE) validToken(token) {
        discountTokens[token].isActive = isActive;
        emit DiscountTokenStatusChanged(token, isActive);
    }
    
    function withdrawFees(
        address token,
        address recipient,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        if (token == address(0) || recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (amount > collectedFees[token]) revert InsufficientFeeBalance();
        
        collectedFees[token] -= amount;
        IERC20(token).safeTransfer(recipient, amount);
        
        emit FeeWithdrawn(token, recipient, amount);
    }
    
    function emergencyWithdraw(
        address token,
        address recipient,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        if (token == address(0) || recipient == address(0)) revert ZeroAddress();
        
        IERC20(token).safeTransfer(recipient, amount);
        emit EmergencyWithdrawal(token, recipient, amount);
    }
    
    function togglePause() external onlyRole(ADMIN_ROLE) {
        paused() ? _unpause() : _pause();
    }
}