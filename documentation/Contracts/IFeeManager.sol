// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IFeeManager {
    // Events
    event DiscountEligibilityChecked(address indexed user, bool isEligible, uint256 fiboBalance, uint256 orioBalance);
    event FeeCollected(address indexed token, uint256 amount);
    event FeesUpdated(uint256 newBaseFee, uint256 newDiscountedFee);
    event DiscountTokenUpdated(address indexed token, uint256 newThreshold);
    event FeeWithdrawn(address indexed token, address indexed recipient, uint256 amount);
    event DiscountTokenStatusChanged(address indexed token, bool isActive);
    event EmergencyWithdrawal(address indexed token, address indexed recipient, uint256 amount);

    // Functions
    function calculateFee(address user, uint256 amount) external view returns (uint256);
    function processFee(address token, uint256 amount) external;
    function isEligibleForDiscount(address user) external view returns (bool);
    function checkAndEmitEligibility(address user) external returns (bool);
}