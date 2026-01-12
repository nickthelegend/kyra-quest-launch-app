// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PlayerRegistry
 * @dev Tracks player progression (XP, Level, Quests Completed) for KyraQuest.
 * Designed to be updated by authorized QuestVault contracts.
 */
contract PlayerRegistry is Ownable {
    struct Player {
        uint32 questsCompleted;
        uint64 xp;
        uint8 level;
        uint64 lastClaimAt;
    }

    mapping(address => Player) public players;
    mapping(address => bool) public isAuthorizedUpdater;

    event PlayerUpdated(address indexed player, uint32 questsCompleted, uint64 xp, uint8 level);
    event UpdaterStatusChanged(address indexed updater, bool status);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Authorize or deauthorize an address (e.g., QuestVault or Factory) to update player stats.
     * @param updater The address to update status for.
     * @param status True to authorize, false to revoke.
     */
    function setUpdaterStatus(address updater, bool status) external onlyOwner {
        isAuthorizedUpdater[updater] = status;
        emit UpdaterStatusChanged(updater, status);
    }

    /**
     * @dev Updates player stats after a successful quest claim.
     * Called by authorized QuestVaults.
     * @param user The address of the player.
     * @param xpReward The amount of XP to grant.
     */
    function updatePlayer(address user, uint256 xpReward) external {
        require(isAuthorizedUpdater[msg.sender], "PlayerRegistry: Not authorized to update");

        Player storage p = players[user];
        p.questsCompleted += 1;
        p.xp += uint64(xpReward);
        p.lastClaimAt = uint64(block.timestamp);

        // Simple leveling logic: 1000 XP per level
        p.level = uint8(p.xp / 1000) + 1;

        emit PlayerUpdated(user, p.questsCompleted, p.xp, p.level);
    }

    /**
     * @dev Retrieve full player stats.
     */
    function getPlayer(address user) external view returns (Player memory) {
        return players[user];
    }
}
