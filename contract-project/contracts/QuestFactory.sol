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
        Quest.QuestConfig calldata _config
    ) external returns (address) {
        require(_config.rewardType == Quest.RewardType.ERC20, "Factory: Must be ERC20");
        
        Quest newQuest = new Quest(
            _config,
            msg.sender
        );
        
        address questAddress = address(newQuest);
        quests.push(questAddress);
        creatorQuests[msg.sender].push(questAddress);
        
        emit QuestCreated(
            questAddress,
            msg.sender,
            _config.name,
            Quest.RewardType.ERC20,
            _config.questType,
            _config.rewardToken
        );
        
        return questAddress;
    }
    
    /**
     * @dev Create a new NFT reward quest
     */
    function createNFTQuest(
        Quest.QuestConfig calldata _config
    ) external returns (address) {
        require(_config.rewardType == Quest.RewardType.ERC721, "Factory: Must be ERC721");

        Quest newQuest = new Quest(
            _config,
            msg.sender
        );
        
        address questAddress = address(newQuest);
        quests.push(questAddress);
        creatorQuests[msg.sender].push(questAddress);
        
        emit QuestCreated(
            questAddress,
            msg.sender,
            _config.name,
            Quest.RewardType.ERC721,
            _config.questType,
            _config.rewardToken
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
