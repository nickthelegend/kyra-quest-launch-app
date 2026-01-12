import hardhatEthersPlugin from "@nomicfoundation/hardhat-ethers";
import hardhatIgnitionPlugin from "@nomicfoundation/hardhat-ignition-ethers";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.20",
    plugins: [
        hardhatEthersPlugin,
        hardhatIgnitionPlugin,
    ],
    networks: {
        hardhat: {
            type: "edr-simulated",
            chainId: 1337,
        },
        local: {
            type: "http",
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: "lazy sand age nominee level cherry toilet marble correct blur combine engine",
            },
        },
        mantleSepolia: {
            type: "http",
            url: "https://rpc.sepolia.mantle.xyz",
            accounts: {
                mnemonic: "dish public milk ramp capable venue poverty grain useless december hedgehog shuffle",
            },
        }
    }
};
