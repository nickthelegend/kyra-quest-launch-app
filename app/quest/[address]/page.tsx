"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Coins, Users, Calendar, Clock, ExternalLink, Loader2, CheckCircle2, AlertCircle, Trophy, Share2, Copy, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ethers } from "ethers"
import { motion } from "framer-motion"
import { toast } from "sonner"
import QuestABI from "@/contracts/abis/Quest.json"

interface Quest {
    id: string
    address: string
    name: string
    description: string | null
    quest_type: string
    reward_token: string
    reward_per_claim: string
    max_claims: number
    claims_made: number
    expiry_timestamp: number
    creator: string
    is_active: boolean
    created_at: string
    image_url: string | null
}

export default function QuestDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { authenticated, login } = usePrivy()
    const { wallets } = useWallets()
    const [quest, setQuest] = useState<Quest | null>(null)
    const [loading, setLoading] = useState(true)
    const [claiming, setClaiming] = useState(false)
    const [hasClaimed, setHasClaimed] = useState(false)

    const wallet = wallets[0]
    const questAddress = params.address as string

    useEffect(() => {
        if (questAddress) {
            fetchQuest()
        }
    }, [questAddress])

    useEffect(() => {
        if (wallet?.address && quest) {
            checkIfClaimed()
        }
    }, [wallet?.address, quest])

    const fetchQuest = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("quests")
                .select("*")
                .eq("address", questAddress)
                .single()

            if (error) throw error
            setQuest(data)
        } catch (err) {
            console.error("Error fetching quest:", err)
            toast.error("Quest not found")
        } finally {
            setLoading(false)
        }
    }

    const checkIfClaimed = async () => {
        if (!wallet?.address || !quest) return

        try {
            // First check Supabase
            const { data } = await supabase
                .from("quest_claims")
                .select("id")
                .eq("quest_id", quest.id)
                .eq("player_wallet", wallet.address)
                .single()

            if (data) {
                setHasClaimed(true)
                return
            }

            // Also check on-chain
            try {
                const ethereumProvider = await wallet.getEthereumProvider()
                const provider = new ethers.BrowserProvider(ethereumProvider)
                const questContract = new ethers.Contract(quest.address, QuestABI, provider)
                const claimed = await questContract.hasClaimed(wallet.address)
                setHasClaimed(claimed)
            } catch {
                setHasClaimed(false)
            }
        } catch {
            setHasClaimed(false)
        }
    }

    const handleClaim = async () => {
        if (!wallet || !quest) return

        setClaiming(true)
        try {
            // Show quest type specific message
            const questTypeMsg = quest.quest_type === "map"
                ? "Please complete the location verification to claim this reward."
                : quest.quest_type === "qr"
                    ? "Please scan the QR code at the location to claim this reward."
                    : "Please complete identity verification to claim this reward."

            toast.info(questTypeMsg)

            // For now, we'll show that this requires a backend signature
            // In production, the backend would verify the quest completion and provide a signature
            toast.info("Verification in progress... Please wait.")

            // Simulate verification delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            // TODO: In production, call backend API to get signature after verification
            // const response = await fetch('/api/quests/verify', {
            //   method: 'POST',
            //   body: JSON.stringify({ questAddress: quest.address, userAddress: wallet.address })
            // })
            // const { signature } = await response.json()

            toast.error("Quest verification not yet implemented. Please check back later!")

            // Production code would be:
            // const ethereumProvider = await wallet.getEthereumProvider()
            // const provider = new ethers.BrowserProvider(ethereumProvider)
            // const signer = await provider.getSigner()
            // const questContract = new ethers.Contract(quest.address, QuestABI, signer)
            // const tx = await questContract.claim(wallet.address, signature)
            // const receipt = await tx.wait()
            // ... record in supabase

        } catch (err: any) {
            console.error("Claim error:", err)
            toast.error(err.message || "Failed to claim reward")
        } finally {
            setClaiming(false)
        }
    }

    const copyAddress = () => {
        navigator.clipboard.writeText(questAddress)
        toast.success("Address copied to clipboard")
    }

    const shareQuest = () => {
        navigator.share?.({
            title: quest?.name || "Quest",
            text: quest?.description || "Check out this quest!",
            url: window.location.href
        }).catch(() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success("Link copied to clipboard")
        })
    }

    const formatReward = (rewardPerClaim: string) => {
        try {
            return ethers.formatUnits(rewardPerClaim, 18)
        } catch {
            return rewardPerClaim
        }
    }

    const getQuestTypeBadge = (type: string) => {
        switch (type) {
            case "map":
                return { label: "🗺️ Map Hunt", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", gradient: "from-orange-500 to-red-500" }
            case "qr":
                return { label: "📱 QR Scan", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", gradient: "from-purple-500 to-pink-500" }
            case "verification":
            default:
                return { label: "✓ Identity", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", gradient: "from-violet-500 to-purple-500" }
        }
    }

    const isExpired = (timestamp: number) => {
        return Date.now() / 1000 > timestamp
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getTimeRemaining = (timestamp: number) => {
        const now = Date.now() / 1000
        const remaining = timestamp - now

        if (remaining <= 0) return "Expired"

        const days = Math.floor(remaining / 86400)
        const hours = Math.floor((remaining % 86400) / 3600)

        if (days > 0) return `${days}d ${hours}h remaining`
        return `${hours}h remaining`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                </div>
                <Navigation />
                <div className="relative z-10 pt-32 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <p className="text-gray-400 mt-4">Loading quest...</p>
                </div>
            </div>
        )
    }

    if (!quest) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                </div>
                <Navigation />
                <div className="relative z-10 pt-32 px-4">
                    <div className="container mx-auto max-w-2xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-12 rounded-3xl border border-white/10"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">Quest Not Found</h1>
                            <p className="text-gray-400 mb-8">The quest you're looking for doesn't exist or has been removed.</p>
                            <Link href="/quests">
                                <Button className="bg-gradient-to-r from-violet-500 to-purple-500">
                                    Browse Quests
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        )
    }

    const typeBadge = getQuestTypeBadge(quest.quest_type)
    const expired = isExpired(quest.expiry_timestamp)
    const progress = quest.max_claims > 0 ? (quest.claims_made / quest.max_claims) * 100 : 0
    const isFull = quest.claims_made >= quest.max_claims

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
            {/* Animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]" />
            </div>

            <Navigation />

            <div className="relative z-10 pt-28 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Back button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href="/quests" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Quests
                        </Link>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="overflow-hidden rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl">
                            {/* Header gradient */}
                            <div className={`h-2 bg-gradient-to-r ${typeBadge.gradient}`} />

                            <div className="p-8 md:p-12">
                                {/* Badges */}
                                <div className="flex items-center gap-3 flex-wrap mb-6">
                                    <Badge className={`${typeBadge.color} border`}>
                                        {typeBadge.label}
                                    </Badge>
                                    {expired ? (
                                        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                                            Expired
                                        </Badge>
                                    ) : isFull ? (
                                        <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                            Fully Claimed
                                        </Badge>
                                    ) : quest.is_active ? (
                                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                            Paused
                                        </Badge>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                                    {quest.name}
                                </h1>

                                {/* Description */}
                                {quest.description && (
                                    <p className="text-gray-400 text-lg mb-8">{quest.description}</p>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Coins className="w-5 h-5 text-violet-400" />
                                            <span className="text-sm text-gray-400">Reward</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {formatReward(quest.reward_per_claim)} <span className="text-violet-400 text-base">KYRA</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Users className="w-5 h-5 text-green-400" />
                                            <span className="text-sm text-gray-400">Claims</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {quest.claims_made} <span className="text-gray-500 text-base">/ {quest.max_claims}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="w-5 h-5 text-orange-400" />
                                            <span className="text-sm text-gray-400">Expires</span>
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            {formatDate(quest.expiry_timestamp).split(",")[0]}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm text-gray-400">Time Left</span>
                                        </div>
                                        <div className={`text-lg font-bold ${expired ? "text-red-400" : "text-white"}`}>
                                            {getTimeRemaining(quest.expiry_timestamp)}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-8">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>{progress.toFixed(1)}% claimed</span>
                                        <span>{quest.max_claims - quest.claims_made} spots remaining</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${typeBadge.gradient} rounded-full transition-all`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Contract Address */}
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 mb-8">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Contract Address</p>
                                        <p className="text-sm text-white font-mono truncate">{quest.address}</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={copyAddress} className="bg-transparent border-white/10">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <a
                                        href={`https://explorer.sepolia.mantle.xyz/address/${quest.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm" variant="outline" className="bg-transparent border-white/10">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </a>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {!authenticated ? (
                                        <Button
                                            onClick={login}
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25"
                                        >
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Connect Wallet to Claim
                                        </Button>
                                    ) : hasClaimed ? (
                                        <Button
                                            disabled
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-green-500/20 text-green-400 cursor-not-allowed"
                                        >
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Already Claimed
                                        </Button>
                                    ) : expired || isFull || !quest.is_active ? (
                                        <Button
                                            disabled
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                        >
                                            {expired ? "Quest Expired" : isFull ? "Fully Claimed" : "Quest Paused"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleClaim}
                                            disabled={claiming}
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
                                        >
                                            {claiming ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Claiming...
                                                </>
                                            ) : (
                                                <>
                                                    <Trophy className="w-5 h-5 mr-2" />
                                                    Claim {formatReward(quest.reward_per_claim)} KYRA
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    <Button
                                        onClick={shareQuest}
                                        size="lg"
                                        variant="outline"
                                        className="h-14 rounded-xl bg-transparent border-white/10 hover:bg-white/5"
                                    >
                                        <Share2 className="w-5 h-5 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
