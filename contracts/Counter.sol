// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    uint256 private count;

    event Increment(address indexed by, uint256 newValue, uint256 timestamp);
    event Decrement(address indexed by, uint256 newValue, uint256 timestamp);
    event Reset(address indexed by, uint256 timestamp);

    function getCount() public view returns (uint256) {
        return count;
    }

    function increment() public {
        count += 1;
        emit Increment(msg.sender, count, block.timestamp);
    }

    function decrement() public {
        require(count > 0, "Counter: cannot decrement below zero");
        count -= 1;
        emit Decrement(msg.sender, count, block.timestamp);
    }

    function reset() public {
        count = 0;
        emit Reset(msg.sender, block.timestamp);
    }
} 