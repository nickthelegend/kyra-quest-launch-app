// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./QuestVault.sol";
import "./PlayerRegistry.sol";

/**
 * @title QuestFactory
 * @dev Single entry point to create and track KyraQuest vaults.
 */
contract QuestFactory {
    address[] public quests;
    PlayerRegistry public immutable registry;
    address public immutable trustedSigner;

    event QuestCreated(address indexed questAddress, address indexed creator);

    /**
     * @param _registry Address of the PlayerRegistry contract.
     * @param _signer Address of the off-chain signer used for claim verification.
     */
    constructor(address _registry, address _signer) {
        registry = PlayerRegistry(_registry);
        trustedSigner = _signer;
    }

    /**
     * @dev Deploys a new QuestVault and registers it as an authorized updater in the PlayerRegistry.
     * IMPORTANT: This factory must be the owner of the PlayerRegistry or have authorization rights.
     *
     * @param _rewardToken ERC20 token to be distributed as reward.
     * @param _rewardPerClaim Amount of token granted per claim.
     * @param _maxClaims Total allowed number of claims.
     * @param _expiryTimestamp Time after which quest expires.
     */
    function createQuest(
        address _rewardToken,
        uint256 _rewardPerClaim,
        uint256 _maxClaims,
        uint64 _expiryTimestamp
    ) external returns (address) {
        QuestVault newQuest = new QuestVault(
            _rewardToken,
            _rewardPerClaim,
            _maxClaims,
            _expiryTimestamp,
            msg.sender,
            trustedSigner,
            address(registry)
        );

        address questAddress = address(newQuest);
        quests.push(questAddress);

        // Authorize the new quest vault to update player stats.
        // This call requires the factory to be the owner of the registry.
        registry.setUpdaterStatus(questAddress, true);

        emit QuestCreated(questAddress, msg.sender);
        return questAddress;
    }

    /**
     * @dev Returns all deployed quest vault addresses.
     */
    function getAllQuests() external view returns (address[] memory) {
        return quests;
    }

    /**
     * @dev Returns the total number of quests created.
     */
    function getQuestCount() external view returns (uint256) {
        return quests.length;
    }
}
