"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Coins, Loader2, CheckCircle2, ExternalLink } from "lucide-react"
import { ethers } from "ethers"
import { toast } from "sonner"
import { KYRA_TOKEN_ADDRESS } from "@/lib/constants"
import QuestArtifact from "@/contracts/abis/Quest.json"
import CustomTokenArtifact from "@/contracts/abis/CustomToken.json"

const QuestABI = QuestArtifact.abi
const ERC20ABI = CustomTokenArtifact.abi

interface FundQuestModalProps {
    isOpen: boolean
    onClose: () => void
    questAddress: string
    questName: string
    rewardToken: string
    rewardPerClaim: string
    maxClaims: number
    claimsMade: number
    wallet: any
    onFunded: () => void
    tokenSymbol?: string
}

export function FundQuestModal({
    isOpen,
    onClose,
    questAddress,
    questName,
    rewardToken,
    rewardPerClaim,
    maxClaims,
    claimsMade,
    wallet,
    onFunded,
    tokenSymbol = "TOKEN"
}: FundQuestModalProps) {
    const [amount, setAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<"input" | "approve" | "fund" | "success">("input")
    const [txHash, setTxHash] = useState<string | null>(null)
    const [symbol, setSymbol] = useState(tokenSymbol)
    const [balance, setBalance] = useState<string | null>(null)

    const isKYRA = rewardToken.toLowerCase() === KYRA_TOKEN_ADDRESS.toLowerCase()

    // Calculate required tokens
    const remainingClaims = maxClaims - claimsMade
    const requiredTokens = ethers.formatUnits(
        BigInt(rewardPerClaim) * BigInt(remainingClaims),
        18
    )

    // Fetch token symbol and balance
    useEffect(() => {
        const fetchTokenInfo = async () => {
            if (!wallet || !isOpen) return
            try {
                const ethereumProvider = await wallet.getEthereumProvider()
                const provider = new ethers.BrowserProvider(ethereumProvider)
                const tokenContract = new ethers.Contract(rewardToken, ERC20ABI, provider)

                const [tokenSymbol, tokenBalance] = await Promise.all([
                    tokenContract.symbol(),
                    tokenContract.balanceOf(wallet.address)
                ])

                setSymbol(tokenSymbol)
                setBalance(ethers.formatUnits(tokenBalance, 18))
            } catch (err) {
                console.error("Error fetching token info:", err)
            }
        }
        fetchTokenInfo()
    }, [wallet, rewardToken, isOpen])

    const handleFund = async () => {
        if (!wallet || !amount) return

        setLoading(true)
        try {
            const ethereumProvider = await wallet.getEthereumProvider()
            const provider = new ethers.BrowserProvider(ethereumProvider)
            const signer = await provider.getSigner()

            const tokenContract = new ethers.Contract(rewardToken, ERC20ABI, signer)
            const questContract = new ethers.Contract(questAddress, QuestABI, signer)

            const amountWei = ethers.parseUnits(amount, 18)

            // Step 1: Approve tokens
            setStep("approve")
            toast.info("Approving token transfer...")
            const approveTx = await tokenContract.approve(questAddress, amountWei)
            await approveTx.wait()
            toast.success("Approval confirmed!")

            // Step 2: Fund the quest
            setStep("fund")
            toast.info("Funding quest...")
            const fundTx = await questContract.fundWithTokens(amountWei)
            setTxHash(fundTx.hash)
            await fundTx.wait()

            setStep("success")
            toast.success(`Quest funded with ${amount} ${symbol}!`)
            onFunded()

        } catch (err: any) {
            console.error("Fund error:", err)
            toast.error(err.reason || err.message || "Failed to fund quest")
            setStep("input")
        } finally {
            setLoading(false)
        }
    }

    const handleFaucet = async () => {
        if (!wallet || !isKYRA) return

        setLoading(true)
        try {
            const ethereumProvider = await wallet.getEthereumProvider()
            const provider = new ethers.BrowserProvider(ethereumProvider)
            const signer = await provider.getSigner()

            const kyraToken = new ethers.Contract(KYRA_TOKEN_ADDRESS, ERC20ABI, signer)

            toast.info("Claiming KYRA from faucet...")
            const tx = await kyraToken.faucet(ethers.parseUnits("1000", 18))
            await tx.wait()
            toast.success("Claimed 1000 KYRA from faucet!")

            // Refresh balance
            const newBalance = await kyraToken.balanceOf(wallet.address)
            setBalance(ethers.formatUnits(newBalance, 18))

        } catch (err: any) {
            console.error("Faucet error:", err)
            toast.error(err.reason || err.message || "Faucet failed")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setStep("input")
        setAmount("")
        setTxHash(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md"
                >
                    <Card className="p-6 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Fund Quest</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {step === "success" ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">Quest Funded!</h4>
                                <p className="text-gray-400 mb-4">Your quest is now ready for claims.</p>
                                {txHash && (
                                    <a
                                        href={`https://explorer.sepolia.mantle.xyz/tx/${txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300"
                                    >
                                        View Transaction <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                <Button
                                    onClick={handleClose}
                                    className="w-full mt-6 bg-gradient-to-r from-violet-500 to-purple-500"
                                >
                                    Done
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                                    <p className="text-sm text-gray-400 mb-1">Quest</p>
                                    <p className="text-white font-medium">{questName}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1 truncate">{questAddress}</p>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Token:</span>
                                        <span className="text-violet-400 font-bold">{symbol}</span>
                                    </div>
                                    {balance && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Your balance:</span>
                                            <span className="text-white">{Number(balance).toLocaleString()} {symbol}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Reward per claim:</span>
                                        <span className="text-white">{ethers.formatUnits(rewardPerClaim, 18)} {symbol}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Remaining claims:</span>
                                        <span className="text-white">{remainingClaims} / {maxClaims}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Required tokens:</span>
                                        <span className="text-violet-400 font-bold">{requiredTokens} {symbol}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <Label className="text-gray-300">Amount to fund ({symbol})</Label>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder={requiredTokens}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                    <button
                                        onClick={() => setAmount(requiredTokens)}
                                        className="text-xs text-violet-400 hover:text-violet-300"
                                    >
                                        Use required amount
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    {isKYRA && (
                                        <Button
                                            onClick={handleFaucet}
                                            disabled={loading}
                                            variant="outline"
                                            className="flex-1 bg-transparent border-white/10"
                                        >
                                            {loading && step === "input" ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Coins className="w-4 h-4 mr-2" />
                                                    Get KYRA
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleFund}
                                        disabled={loading || !amount}
                                        className={`${isKYRA ? 'flex-1' : 'w-full'} bg-gradient-to-r from-violet-500 to-purple-500`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {step === "approve" ? "Approving..." : "Funding..."}
                                            </>
                                        ) : (
                                            "Fund Quest"
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
