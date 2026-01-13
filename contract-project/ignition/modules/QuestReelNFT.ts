import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const QuestReelNFTModule = buildModule("QuestReelNFTModule", (m) => {
    const questReelNFT = m.contract("QuestReelNFT");

    return { questReelNFT };
});

export default QuestReelNFTModule;
