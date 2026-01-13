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
 * Simplified version without signature verification for simple quests
 */
contract Quest is Ownable, ReentrancyGuard, IERC721Receiver {
    using SafeERC20 for IERC20;
    
    enum RewardType { ERC20, ERC721 }
    enum QuestType { SIMPLE, QR, MAP }
    
    // Quest configuration
    string public name;
    string public description;
    RewardType public rewardType;
    QuestType public questType;
    address public rewardToken; // ERC20 or ERC721 address
    uint256 public rewardAmount; // Amount per claim (for ERC20)
    uint256 public maxClaims;
    uint256 public claimsMade;
    uint64 public expiryTimestamp;
    bool public active;
    
    // NFT reward tracking
    uint256[] public nftRewardIds; // Token IDs available for claiming
    uint256 public nextNftIndex;
    
    // Claim tracking
    mapping(address => bool) public hasClaimed;
    
    // Events
    event QuestCreated(address indexed creator, string name, RewardType rewardType);
    event RewardClaimed(address indexed user, uint256 amount, uint256 tokenId);
    event QuestFunded(address indexed funder, uint256 amount);
    event QuestClosed(string reason);
    event NFTDeposited(uint256 tokenId);
    
    constructor(
        string memory _name,
        string memory _description,
        RewardType _rewardType,
        QuestType _questType,
        address _rewardToken,
        uint256 _rewardAmount,
        uint256 _maxClaims,
        uint64 _expiryTimestamp,
        address _creator
    ) Ownable(_creator) {
        name = _name;
        description = _description;
        rewardType = _rewardType;
        questType = _questType;
        rewardToken = _rewardToken;
        rewardAmount = _rewardAmount;
        maxClaims = _maxClaims;
        expiryTimestamp = _expiryTimestamp;
        active = true;
        
        emit QuestCreated(_creator, _name, _rewardType);
    }
    
    /**
     * @dev Fund the quest with ERC20 tokens
     */
    function fundWithTokens(uint256 amount) external {
        require(rewardType == RewardType.ERC20, "Quest: Not an ERC20 quest");
        IERC20(rewardToken).safeTransferFrom(msg.sender, address(this), amount);
        emit QuestFunded(msg.sender, amount);
    }
    
    /**
     * @dev Deposit NFT rewards (must be called by NFT owner)
     */
    function depositNFT(uint256 tokenId) external {
        require(rewardType == RewardType.ERC721, "Quest: Not an NFT quest");
        IERC721(rewardToken).safeTransferFrom(msg.sender, address(this), tokenId);
        nftRewardIds.push(tokenId);
        emit NFTDeposited(tokenId);
    }
    
    /**
     * @dev Deposit multiple NFTs
     */
    function depositNFTBatch(uint256[] calldata tokenIds) external {
        require(rewardType == RewardType.ERC721, "Quest: Not an NFT quest");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            IERC721(rewardToken).safeTransferFrom(msg.sender, address(this), tokenIds[i]);
            nftRewardIds.push(tokenIds[i]);
            emit NFTDeposited(tokenIds[i]);
        }
    }
    
    /**
     * @dev Claim reward (Simple quest - no verification needed)
     * For QR and MAP quests, additional verification will be added
     */
    function claim() external nonReentrant {
        require(active, "Quest: Not active");
        require(block.timestamp < expiryTimestamp, "Quest: Expired");
        require(claimsMade < maxClaims, "Quest: Max claims reached");
        require(!hasClaimed[msg.sender], "Quest: Already claimed");
        
        // For simple quests, allow direct claim
        // QR and MAP quests would need additional verification here
        require(questType == QuestType.SIMPLE, "Quest: Verification required");
        
        _processClaim(msg.sender);
    }
    
    /**
     * @dev Claim with verification code (for QR quests)
     */
    function claimWithCode(bytes32 verificationCode) external nonReentrant {
        require(active, "Quest: Not active");
        require(block.timestamp < expiryTimestamp, "Quest: Expired");
        require(claimsMade < maxClaims, "Quest: Max claims reached");
        require(!hasClaimed[msg.sender], "Quest: Already claimed");
        require(questType == QuestType.QR, "Quest: Not a QR quest");
        
        // Simple verification: hash of (quest address + expected code) matches
        // In production, this could be more sophisticated
        bytes32 expectedHash = keccak256(abi.encodePacked(address(this), "KYRA"));
        require(verificationCode == expectedHash, "Quest: Invalid verification code");
        
        _processClaim(msg.sender);
    }
    
    /**
     * @dev Internal function to process the claim
     */
    function _processClaim(address user) internal {
        hasClaimed[user] = true;
        claimsMade++;
        
        if (rewardType == RewardType.ERC20) {
            // Transfer ERC20 tokens
            require(
                IERC20(rewardToken).balanceOf(address(this)) >= rewardAmount,
                "Quest: Insufficient reward balance"
            );
            IERC20(rewardToken).safeTransfer(user, rewardAmount);
            emit RewardClaimed(user, rewardAmount, 0);
        } else {
            // Transfer next available NFT
            require(nextNftIndex < nftRewardIds.length, "Quest: No NFTs available");
            uint256 tokenId = nftRewardIds[nextNftIndex];
            nextNftIndex++;
            IERC721(rewardToken).safeTransferFrom(address(this), user, tokenId);
            emit RewardClaimed(user, 1, tokenId);
        }
        
        // Auto-close if max claims reached
        if (claimsMade >= maxClaims) {
            _close("Max claims reached");
        }
    }
    
    /**
     * @dev Close the quest manually (only owner)
     */
    function close() external onlyOwner {
        _close("Manual close by owner");
    }
    
    function _close(string memory reason) internal {
        active = false;
        emit QuestClosed(reason);
    }
    
    /**
     * @dev Withdraw remaining rewards (only owner, only when closed or expired)
     */
    function withdrawRemaining() external onlyOwner {
        require(!active || block.timestamp >= expiryTimestamp, "Quest: Still active");
        
        if (rewardType == RewardType.ERC20) {
            uint256 balance = IERC20(rewardToken).balanceOf(address(this));
            if (balance > 0) {
                IERC20(rewardToken).safeTransfer(owner(), balance);
            }
        } else {
            // Return remaining NFTs
            for (uint256 i = nextNftIndex; i < nftRewardIds.length; i++) {
                IERC721(rewardToken).safeTransferFrom(address(this), owner(), nftRewardIds[i]);
            }
        }
    }
    
    /**
     * @dev Get available rewards count
     */
    function getAvailableRewards() external view returns (uint256) {
        if (rewardType == RewardType.ERC20) {
            return IERC20(rewardToken).balanceOf(address(this)) / rewardAmount;
        } else {
            return nftRewardIds.length - nextNftIndex;
        }
    }
    
    /**
     * @dev Get quest info
     */
    function getQuestInfo() external view returns (
        string memory _name,
        string memory _description,
        RewardType _rewardType,
        QuestType _questType,
        address _rewardToken,
        uint256 _rewardAmount,
        uint256 _maxClaims,
        uint256 _claimsMade,
        uint64 _expiryTimestamp,
        bool _active
    ) {
        return (
            name,
            description,
            rewardType,
            questType,
            rewardToken,
            rewardAmount,
            maxClaims,
            claimsMade,
            expiryTimestamp,
            active
        );
    }
    
    // Required for receiving NFTs
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
