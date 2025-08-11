// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Subscription {
    address public owner;

    // Subscription durations in seconds
    uint256 constant ONE_WEEK = 7 days;
    uint256 constant ONE_MONTH = 30 days;
    uint256 constant ONE_YEAR = 365 days;

    // Subscription prices in wei (1 ETH = 10^18 wei)
    uint256 public priceWeek;
    uint256 public priceMonth;
    uint256 public priceYear;

    // Mapping of user addresses to subscription end timestamps
    mapping(address => uint256) public subscriptions;

    event Subscribed(address indexed user, uint256 duration, uint256 expiry);
    event PriceUpdated(uint256 weekPrice, uint256 monthPrice, uint256 yearPrice);
    event Withdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(uint256 _priceWeek, uint256 _priceMonth, uint256 _priceYear) {
        owner = msg.sender;
        priceWeek = _priceWeek;
        priceMonth = _priceMonth;
        priceYear = _priceYear;
    }

    function subscribe(uint8 _option) external payable {
        require(_option >= 1 && _option <= 3, "Invalid option");
        uint256 requiredAmount;
        uint256 duration;

        if (_option == 1) {
            requiredAmount = priceWeek;
            duration = ONE_WEEK;
        } else if (_option == 2) {
            requiredAmount = priceMonth;
            duration = ONE_MONTH;
        } else {
            requiredAmount = priceYear;
            duration = ONE_YEAR;
        }

        require(msg.value == requiredAmount, "Incorrect amount");

        // Extend subscription if active, otherwise start fresh
        if (subscriptions[msg.sender] > block.timestamp) {
            subscriptions[msg.sender] += duration;
        } else {
            subscriptions[msg.sender] = block.timestamp + duration;
        }

        emit Subscribed(msg.sender, duration, subscriptions[msg.sender]);
    }

    function isSubscribed(address _user) external view returns (bool) {
        return subscriptions[_user] > block.timestamp;
    }

    function updatePrices(uint256 _priceWeek, uint256 _priceMonth, uint256 _priceYear) external onlyOwner {
        priceWeek = _priceWeek;
        priceMonth = _priceMonth;
        priceYear = _priceYear;
        emit PriceUpdated(_priceWeek, _priceMonth, _priceYear);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        payable(owner).transfer(balance);
        emit Withdrawn(owner, balance);
    }
}
