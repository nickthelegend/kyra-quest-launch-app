// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./PlayerRegistry.sol";

/**
 * @title QuestVault
 * @dev Holds rewards for exactly ONE quest. Releases rewards on valid signature.
 * Integrates Chainlink Automation to close expired or exhausted quests.
 */
contract QuestVault is AutomationCompatibleInterface {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    address public immutable rewardToken;
    uint256 public immutable rewardPerClaim;
    uint256 public immutable maxClaims;
    uint256 public claimsMade;
    uint64 public immutable expiryTimestamp;
    bool public active;
    address public immutable creator;
    address public immutable signer;
    PlayerRegistry public immutable registry;

    mapping(address => bool) public hasClaimed;

    event ClaimSuccess(address indexed user, uint256 amount);
    event QuestClosed(string reason);

    constructor(
        address _rewardToken,
        uint256 _rewardPerClaim,
        uint256 _maxClaims,
        uint64 _expiryTimestamp,
        address _creator,
        address _signer,
        address _registry
    ) {
        rewardToken = _rewardToken;
        rewardPerClaim = _rewardPerClaim;
        maxClaims = _maxClaims;
        expiryTimestamp = _expiryTimestamp;
        creator = _creator;
        signer = _signer;
        registry = PlayerRegistry(_registry);
        active = true;
    }

    /**
     * @dev Claims the reward. Requires a signature from the KyraQuest trusted signer.
     * @param user The address of the player claiming the reward.
     * @param signature The ECDSA signature verifying the claim.
     */
    function claim(address user, bytes calldata signature) external {
        require(active, "QuestVault: Quest not active");
        require(block.timestamp < expiryTimestamp, "QuestVault: Quest expired");
        require(claimsMade < maxClaims, "QuestVault: Max claims reached");
        require(!hasClaimed[user], "QuestVault: Already claimed");

        // Verify signature: keccak256(address(this), user)
        bytes32 messageHash = keccak256(abi.encodePacked(address(this), user));
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        require(ethSignedHash.recover(signature) == signer, "QuestVault: Invalid signature");

        hasClaimed[user] = true;
        claimsMade += 1;

        // Grant 100 XP fixed per quest completion
        registry.updatePlayer(user, 100); 

        // Transfer reward
        IERC20(rewardToken).safeTransfer(user, rewardPerClaim);

        emit ClaimSuccess(user, rewardPerClaim);

        // Auto-close if max claims reached
        if (claimsMade >= maxClaims) {
            _close("Max claims reached");
        }
    }

    /**
     * @dev Chainlink Automation: Check if quest should be closed.
     */
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        upkeepNeeded = active && (block.timestamp >= expiryTimestamp || claimsMade >= maxClaims);
    }

    /**
     * @dev Chainlink Automation: Perform the closing logic.
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        if (active && (block.timestamp >= expiryTimestamp || claimsMade >= maxClaims)) {
            _close("Chainlink Automation");
        }
    }

    /**
     * @dev Manual close by the quest creator.
     */
    function manualClose() external {
        require(msg.sender == creator, "QuestVault: Only creator");
        _close("Manual close");
    }

    function _close(string memory reason) internal {
        if (!active) return;
        active = false;
        emit QuestClosed(reason);
    }

    /**
     * @dev Creator withdraws any remaining funds after the quest is no longer active.
     */
    function withdrawRemaining() external {
        require(msg.sender == creator, "QuestVault: Only creator");
        require(!active, "QuestVault: Quest still active");
        
        uint256 balance = IERC20(rewardToken).balanceOf(address(this));
        if (balance > 0) {
            IERC20(rewardToken).safeTransfer(creator, balance);
        }
    }
}
