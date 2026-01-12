import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const KyraQuestModule = buildModule("KyraQuestModule", (m) => {
    // 1. Deploy MockKYRA Token
    const mockKyra = m.contract("MockKYRA", []);

    // 2. Deploy PlayerRegistry
    const playerRegistry = m.contract("PlayerRegistry", []);

    // 3. Get the deployer address for trusted signer (will be the deploying account)
    // In Ignition, we can use m.getAccount(0) to get the first signer
    const trustedSigner = m.getAccount(0);

    // 4. Deploy QuestFactory with registry address and trusted signer
    const questFactory = m.contract("QuestFactory", [playerRegistry, trustedSigner]);

    // 5. Transfer ownership of PlayerRegistry to QuestFactory
    // This requires the PlayerRegistry to have transferOwnership function
    m.call(playerRegistry, "transferOwnership", [questFactory]);

    return { mockKyra, playerRegistry, questFactory };
});

export default KyraQuestModule;
