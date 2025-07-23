// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 private count;
    uint256 public constant FEE = 1 ether;

    event Increment(address indexed by, uint256 newValue, uint256 timestamp);
    event Decrement(address indexed by, uint256 newValue, uint256 timestamp);
    event Reset(address indexed by, uint256 timestamp);

    function getCount() public view returns (uint256) {
        return count;
    }

    function increment() public payable {
        require(msg.value == FEE, "Must send exactly 0.01 ETH");
        count += 1;
        emit Increment(msg.sender, count, block.timestamp);
    }

    function decrement() public {
        require(count > 0, "Counter: cannot decrement below zero");
        require(address(this).balance >= FEE, "Insufficient contract balance");
        count -= 1;
        payable(msg.sender).transfer(FEE);
        emit Decrement(msg.sender, count, block.timestamp);
    }

    function reset() public {
        count = 0;
        emit Reset(msg.sender, block.timestamp);
    }
} 