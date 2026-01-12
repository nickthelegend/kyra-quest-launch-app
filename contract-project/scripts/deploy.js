import hre from "hardhat";

async function main() {
    const { ethers } = hre;

    if (!ethers) {
        throw new Error("ethers not found in HRE. Make sure @nomicfoundation/hardhat-ethers is installed and loaded.");
    }

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy MockKYRA
    const MockKYRAAddress = await ethers.getContractFactory("MockKYRA");
    const kyra = await MockKYRAAddress.deploy();
    await kyra.waitForDeployment();
    const kyraAddress = await kyra.getAddress();
    console.log("MockKYRA deployed to:", kyraAddress);

    // 2. Deploy PlayerRegistry
    const PlayerRegistry = await ethers.getContractFactory("PlayerRegistry");
    const registry = await PlayerRegistry.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("PlayerRegistry deployed to:", registryAddress);

    // 3. Deploy QuestFactory
    const trustedSigner = deployer.address;
    const QuestFactory = await ethers.getContractFactory("QuestFactory");
    const factory = await QuestFactory.deploy(registryAddress, trustedSigner);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("QuestFactory deployed to:", factoryAddress);

    // 4. Transfer ownership of PlayerRegistry to QuestFactory
    console.log("Transferring PlayerRegistry ownership to QuestFactory...");
    const tx = await registry.transferOwnership(factoryAddress);
    await tx.wait();
    console.log("Ownership transferred.");

    console.log("Deployment complete!");
    console.log("-------------------");
    console.log("Registry Address:", registryAddress);
    console.log("Factory Address:", factoryAddress);
    console.log("KYRA Token Address:", kyraAddress);
    console.log("Trusted Signer:", trustedSigner);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
