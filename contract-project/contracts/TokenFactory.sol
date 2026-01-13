// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CustomToken
 * @dev A custom ERC20 token that merchants can create for their quests
 */
contract CustomToken is ERC20, ERC20Burnable, Ownable {
    uint8 private _decimals;
    string private _tokenImage;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        uint256 initialSupply,
        string memory tokenImage,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _decimals = decimalsValue;
        _tokenImage = tokenImage;
        _mint(owner, initialSupply);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function tokenImage() public view returns (string memory) {
        return _tokenImage;
    }
    
    /**
     * @dev Mint additional tokens (only owner)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

/**
 * @title TokenFactory
 * @dev Factory to create custom ERC20 tokens for quest rewards
 */
contract TokenFactory {
    // All tokens created
    address[] public tokens;
    
    // Mapping of creator to their tokens
    mapping(address => address[]) public creatorTokens;
    
    // Token info
    struct TokenInfo {
        string name;
        string symbol;
        uint8 decimals;
        uint256 initialSupply;
        string image;
        address creator;
        uint256 createdAt;
    }
    mapping(address => TokenInfo) public tokenInfo;
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 initialSupply
    );
    
    /**
     * @dev Create a new custom ERC20 token
     */
    function createToken(
        string calldata name,
        string calldata symbol,
        uint8 decimalsValue,
        uint256 initialSupply,
        string calldata image
    ) external returns (address) {
        CustomToken newToken = new CustomToken(
            name,
            symbol,
            decimalsValue,
            initialSupply,
            image,
            msg.sender
        );
        
        address tokenAddress = address(newToken);
        tokens.push(tokenAddress);
        creatorTokens[msg.sender].push(tokenAddress);
        
        tokenInfo[tokenAddress] = TokenInfo({
            name: name,
            symbol: symbol,
            decimals: decimalsValue,
            initialSupply: initialSupply,
            image: image,
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        emit TokenCreated(tokenAddress, msg.sender, name, symbol, initialSupply);
        
        return tokenAddress;
    }
    
    /**
     * @dev Get all tokens
     */
    function getAllTokens() external view returns (address[] memory) {
        return tokens;
    }
    
    /**
     * @dev Get tokens by creator
     */
    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }
    
    /**
     * @dev Get total token count
     */
    function getTokenCount() external view returns (uint256) {
        return tokens.length;
    }
}
