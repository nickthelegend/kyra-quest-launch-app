// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Quest
 * @dev A quest contract that holds and distributes ERC20 tokens or ERC721 NFTs as rewards
 */
contract Quest is Ownable, ReentrancyGuard, IERC721Receiver {
    using SafeERC20 for IERC20;
    
    enum RewardType { ERC20, ERC721 }
    enum QuestType { SIMPLE, QR, MAP }
    
    struct QuestConfig {
        string name;
        string description;
        RewardType rewardType;
        QuestType questType;
        address rewardToken;
        uint256 rewardAmount;
        uint256 maxClaims;
        uint64 expiryTimestamp;
        bool isRecurring;
        uint256 recurringInterval;
    }

    QuestConfig public config;
    uint256 public claimsMade;
    bool public active;
    
    // NFT reward tracking
    uint256[] public nftRewardIds;
    uint256 public nextNftIndex;
    
    // Claim tracking
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public lastClaimTime;
    
    // Events
    event QuestCreated(address indexed creator, string name, RewardType rewardType);
    event RewardClaimed(address indexed user, uint256 amount, uint256 tokenId);
    event QuestFunded(address indexed funder, uint256 amount);
    event QuestClosed(string reason);
    event NFTDeposited(uint256 tokenId);
    
    constructor(
        QuestConfig memory _config,
        address _creator
    ) Ownable(_creator) {
        config = _config;
        active = true;
        emit QuestCreated(_creator, _config.name, _config.rewardType);
    }
    
    function fundWithTokens(uint256 amount) external {
        require(config.rewardType == RewardType.ERC20, "Quest: Not an ERC20 quest");
        IERC20(config.rewardToken).safeTransferFrom(msg.sender, address(this), amount);
        emit QuestFunded(msg.sender, amount);
    }
    
    function depositNFT(uint256 tokenId) external {
        require(config.rewardType == RewardType.ERC721, "Quest: Not an NFT quest");
        IERC721(config.rewardToken).safeTransferFrom(msg.sender, address(this), tokenId);
        nftRewardIds.push(tokenId);
        emit NFTDeposited(tokenId);
    }

    function depositNFTBatch(uint256[] calldata tokenIds) external {
        require(config.rewardType == RewardType.ERC721, "Quest: Not an NFT quest");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            IERC721(config.rewardToken).safeTransferFrom(msg.sender, address(this), tokenIds[i]);
            nftRewardIds.push(tokenIds[i]);
            emit NFTDeposited(tokenIds[i]);
        }
    }
    
    function claim() external nonReentrant {
        require(active, "Quest: Not active");
        require(block.timestamp < config.expiryTimestamp, "Quest: Expired");
        require(claimsMade < config.maxClaims, "Quest: Max claims reached");
        
        if (config.isRecurring) {
            require(block.timestamp >= lastClaimTime[msg.sender] + config.recurringInterval, "Quest: Still in cooldown");
        } else {
            require(!hasClaimed[msg.sender], "Quest: Already claimed");
        }
        
        require(config.questType == QuestType.SIMPLE, "Quest: Verification required");
        
        _processClaim(msg.sender);
    }
    
    function claimWithCode(bytes32 verificationCode) external nonReentrant {
        require(active, "Quest: Not active");
        require(block.timestamp < config.expiryTimestamp, "Quest: Expired");
        require(claimsMade < config.maxClaims, "Quest: Max claims reached");
        
        if (config.isRecurring) {
            require(block.timestamp >= lastClaimTime[msg.sender] + config.recurringInterval, "Quest: Still in cooldown");
        } else {
            require(!hasClaimed[msg.sender], "Quest: Already claimed");
        }
        
        require(config.questType == QuestType.QR, "Quest: Not a QR quest");
        
        bytes32 expectedHash = keccak256(abi.encodePacked(address(this), "KYRA"));
        require(verificationCode == expectedHash, "Quest: Invalid verification code");
        
        _processClaim(msg.sender);
    }
    
    function _processClaim(address user) internal {
        hasClaimed[user] = true;
        lastClaimTime[user] = block.timestamp;
        claimsMade++;
        
        if (config.rewardType == RewardType.ERC20) {
            require(
                IERC20(config.rewardToken).balanceOf(address(this)) >= config.rewardAmount,
                "Quest: Insufficient reward balance"
            );
            IERC20(config.rewardToken).safeTransfer(user, config.rewardAmount);
            emit RewardClaimed(user, config.rewardAmount, 0);
        } else {
            require(nextNftIndex < nftRewardIds.length, "Quest: No NFTs available");
            uint256 tokenId = nftRewardIds[nextNftIndex];
            nextNftIndex++;
            IERC721(config.rewardToken).safeTransferFrom(address(this), user, tokenId);
            emit RewardClaimed(user, 1, tokenId);
        }
        
        if (claimsMade >= config.maxClaims) {
            _close("Max claims reached");
        }
    }
    
    function close() external onlyOwner {
        _close("Manual close by owner");
    }
    
    function _close(string memory reason) internal {
        active = false;
        emit QuestClosed(reason);
    }
    
    function withdrawRemaining() external onlyOwner {
        require(!active || block.timestamp >= config.expiryTimestamp, "Quest: Still active");
        
        if (config.rewardType == RewardType.ERC20) {
            uint256 balance = IERC20(config.rewardToken).balanceOf(address(this));
            if (balance > 0) {
                IERC20(config.rewardToken).safeTransfer(owner(), balance);
            }
        } else {
            for (uint256 i = nextNftIndex; i < nftRewardIds.length; i++) {
                IERC721(config.rewardToken).safeTransferFrom(address(this), owner(), nftRewardIds[i]);
            }
        }
    }
    
    function getAvailableRewards() external view returns (uint256) {
        if (config.rewardType == RewardType.ERC20) {
            return IERC20(config.rewardToken).balanceOf(address(this)) / config.rewardAmount;
        } else {
            return nftRewardIds.length - nextNftIndex;
        }
    }
    
    function getQuestConfig() external view returns (QuestConfig memory) {
        return config;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
