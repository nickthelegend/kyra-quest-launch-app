"use client"

import { useWallets } from "@privy-io/react-auth"
import { base, mainnet, optimism, arbitrum, polygon, mantleSepoliaTestnet } from "viem/chains"
import { useState } from "react"

const CHAINS = [base, mainnet, optimism, arbitrum, polygon, mantleSepoliaTestnet]

export function useNetwork() {
    const { wallets } = useWallets()
    const [isSwitching, setIsSwitching] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const wallet = wallets[0]
    const currentChainId = wallet?.chainId ? parseInt(wallet.chainId.split(":")[1] || wallet.chainId) : null
    const isMantleSepolia = currentChainId === mantleSepoliaTestnet.id

    const currentChain = CHAINS.find((c) => c.id === currentChainId)
    const currentChainName = currentChain ? currentChain.name : currentChainId ? `Chain ${currentChainId}` : "Unknown"

    const switchToMantleSepolia = async () => {
        if (!wallet) {
            console.log("No wallet connected, cannot switch network.")
            return
        }

        console.log(`Starting network switch to Mantle Sepolia (ID: ${mantleSepoliaTestnet.id})...`)
        setIsSwitching(true)
        setError(null)

        try {
            await wallet.switchChain(mantleSepoliaTestnet.id)
            console.log("Successfully switched network to Mantle Sepolia!")
        } catch (err) {
            console.error("Failed to switch network:", err)
            setError(err instanceof Error ? err : new Error("Failed to switch network"))
        } finally {
            setIsSwitching(false)
        }
    }

    return {
        wallet,
        isMantleSepolia,
        currentChainId,
        currentChainName,
        switchToMantleSepolia,
        isSwitching,
        error,
    }
}
