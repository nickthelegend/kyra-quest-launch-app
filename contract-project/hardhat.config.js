import hardhatEthersPlugin from "@nomicfoundation/hardhat-ethers";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.20",
    plugins: [
        hardhatEthersPlugin,
    ],
    networks: {
        hardhat: {
            type: "edr-simulated",
            chainId: 1337,
        }
    }
};

// Log HRE keys at the end of config if possible
// Wait, HH3 might have a hook for this.
