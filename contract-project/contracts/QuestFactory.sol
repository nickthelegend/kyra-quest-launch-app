// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Quest.sol";
import "./KYRAToken.sol";
import "./QuestNFT.sol";

/**
 * @title QuestFactory
 * @dev Factory contract to create and track quests
 */
contract QuestFactory {
    // All created quests
    address[] public quests;
    
    // KYRA token address
    address public immutable kyraToken;
    
    // Mapping of creator to their quests
    mapping(address => address[]) public creatorQuests;
    
    // Events
    event QuestCreated(
        address indexed questAddress,
        address indexed creator,
        string name,
        Quest.RewardType rewardType,
        Quest.QuestType questType,
        address rewardToken
    );
    
    constructor(address _kyraToken) {
        kyraToken = _kyraToken;
    }
    
    /**
     * @dev Create a new ERC20 token reward quest
     */
    function createTokenQuest(
        string calldata _name,
        string calldata _description,
        Quest.QuestType _questType,
        address _rewardToken,
        uint256 _rewardAmount,
        uint256 _maxClaims,
        uint64 _expiryTimestamp
    ) external returns (address) {
        Quest newQuest = new Quest(
            _name,
            _description,
            Quest.RewardType.ERC20,
            _questType,
            _rewardToken,
            _rewardAmount,
            _maxClaims,
            _expiryTimestamp,
            msg.sender
        );
        
        address questAddress = address(newQuest);
        quests.push(questAddress);
        creatorQuests[msg.sender].push(questAddress);
        
        emit QuestCreated(
            questAddress,
            msg.sender,
            _name,
            Quest.RewardType.ERC20,
            _questType,
            _rewardToken
        );
        
        return questAddress;
    }
    
    /**
     * @dev Create a new quest with KYRA token rewards (convenience function)
     */
    function createKYRAQuest(
        string calldata _name,
        string calldata _description,
        Quest.QuestType _questType,
        uint256 _rewardAmount,
        uint256 _maxClaims,
        uint64 _expiryTimestamp
    ) external returns (address) {
        return this.createTokenQuest(
            _name,
            _description,
            _questType,
            kyraToken,
            _rewardAmount,
            _maxClaims,
            _expiryTimestamp
        );
    }
    
    /**
     * @dev Create a new NFT reward quest
     */
    function createNFTQuest(
        string calldata _name,
        string calldata _description,
        Quest.QuestType _questType,
        address _nftContract,
        uint256 _maxClaims,
        uint64 _expiryTimestamp
    ) external returns (address) {
        Quest newQuest = new Quest(
            _name,
            _description,
            Quest.RewardType.ERC721,
            _questType,
            _nftContract,
            1, // Each claim gets 1 NFT
            _maxClaims,
            _expiryTimestamp,
            msg.sender
        );
        
        address questAddress = address(newQuest);
        quests.push(questAddress);
        creatorQuests[msg.sender].push(questAddress);
        
        emit QuestCreated(
            questAddress,
            msg.sender,
            _name,
            Quest.RewardType.ERC721,
            _questType,
            _nftContract
        );
        
        return questAddress;
    }
    
    /**
     * @dev Get all quests
     */
    function getAllQuests() external view returns (address[] memory) {
        return quests;
    }
    
    /**
     * @dev Get quests by creator
     */
    function getQuestsByCreator(address creator) external view returns (address[] memory) {
        return creatorQuests[creator];
    }
    
    /**
     * @dev Get total quest count
     */
    function getQuestCount() external view returns (uint256) {
        return quests.length;
    }
}
