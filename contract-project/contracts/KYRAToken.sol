// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KYRA Token
 * @dev The main reward token for KyraQuest platform
 */
contract KYRAToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    constructor() ERC20("KYRA Token", "KYRA") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 100_000_000 * 10**18); // 100 million initial supply
    }
    
    /**
     * @dev Mint new tokens (only owner can mint)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "KYRA: Max supply exceeded");
        _mint(to, amount);
    }
    
    /**
     * @dev Allows anyone to mint tokens for testing (remove in production)
     * This is for testnet only
     */
    function faucet(uint256 amount) external {
        require(amount <= 10000 * 10**18, "KYRA: Faucet limit 10000 tokens");
        require(totalSupply() + amount <= MAX_SUPPLY, "KYRA: Max supply exceeded");
        _mint(msg.sender, amount);
    }
}
