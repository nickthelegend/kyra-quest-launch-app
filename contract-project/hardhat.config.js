import "@nomicfoundation/hardhat-ethers";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            type: "edr-simulated",
            chainId: 1337,
        },
        ganache: {
            type: "http",
            url: "http://127.0.0.1:7545",
            accounts: {
                mnemonic: "test test test test test test test test test test test junk",
            },
        },
        mantleSepolia: {
            type: "http",
            url: "https://rpc.sepolia.mantle.xyz",
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};
