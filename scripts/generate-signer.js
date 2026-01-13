// Script to generate or derive the Quest Signer wallet
// Run with: node scripts/generate-signer.js

const { ethers } = require("ethers")

// Option 1: Generate a new random wallet
function generateNewWallet() {
    const wallet = ethers.Wallet.createRandom()
    console.log("\n=== NEW SIGNER WALLET ===")
    console.log("Address:", wallet.address)
    console.log("Private Key:", wallet.privateKey)
    console.log("\nAdd this to your .env file:")
    console.log(`QUEST_SIGNER_PRIVATE_KEY=${wallet.privateKey}`)
    console.log("\n⚠️ IMPORTANT: If contracts are already deployed, you need to use")
    console.log("the SAME private key that was used as the deployer (account 0).")
    return wallet
}

// Option 2: Derive from mnemonic (same as deployer)
function deriveFromMnemonic(mnemonic) {
    const wallet = ethers.Wallet.fromPhrase(mnemonic)
    console.log("\n=== DERIVED WALLET (Account 0) ===")
    console.log("Address:", wallet.address)
    console.log("Private Key:", wallet.privateKey)
    console.log("\nAdd this to your .env file:")
    console.log(`QUEST_SIGNER_PRIVATE_KEY=${wallet.privateKey}`)
    return wallet
}

// Main
console.log("===========================================")
console.log("KyraQuest Signer Wallet Generator")
console.log("===========================================")

// Check if mnemonic is provided as argument
const mnemonic = process.argv[2]

if (mnemonic) {
    console.log("\nDeriving wallet from provided mnemonic...")
    deriveFromMnemonic(mnemonic)
} else {
    console.log("\nNo mnemonic provided. Generating new wallet...")
    console.log("(To use existing deployer, run: node scripts/generate-signer.js 'your mnemonic phrase')")
    generateNewWallet()
}

console.log("\n===========================================")
console.log("SETUP INSTRUCTIONS:")
console.log("===========================================")
console.log(`
1. Add QUEST_SIGNER_PRIVATE_KEY to your .env file

2. If you already deployed contracts with a different signer:
   - You need to redeploy the QuestFactory with the new signer address
   - Or use the same private key that was used for deployment

3. For Mantle Sepolia deployment, the signer was set to the deployer account.
   Use the same mnemonic/private key from your hardhat.config.js

4. Restart your Next.js dev server after updating .env
`)
