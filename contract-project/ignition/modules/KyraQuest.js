import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const KyraQuestModule = buildModule("KyraQuestModule", (m) => {
    // 1. Deploy KYRA Token (platform token)
    const kyraToken = m.contract("KYRAToken", []);

    // 2. Deploy TokenFactory (for custom merchant tokens)
    const tokenFactory = m.contract("TokenFactory", []);

    // 3. Deploy QuestFactory with KYRA token address
    const questFactory = m.contract("QuestFactory", [kyraToken]);

    return { kyraToken, tokenFactory, questFactory };
});

export default KyraQuestModule;
