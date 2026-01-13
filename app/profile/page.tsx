"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import Link from "next/link"
import { Trophy, Coins, Star, Clock, CheckCircle2, Loader2, Wallet, Sparkles, ArrowRight, Package } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ethers } from "ethers"
import { motion, AnimatePresence } from "framer-motion"
import { KYRA_TOKEN_ADDRESS } from "@/lib/constants"
import KYRAArtifact from "@/contracts/abis/KYRAToken.json"

const KYRAABI = KYRAArtifact.abi

interface ClaimedQuest {
    id: string
    quest_id: string
    tx_hash: string
    xp_earned: number
    claimed_at: string
    quest: {
        name: string
        description: string | null
        quest_type: string
        reward_per_claim: string
        address: string
    } | null
}

export default function ProfilePage() {
    const { authenticated, login } = usePrivy()
    const { wallets } = useWallets()
    const [claims, setClaims] = useState<ClaimedQuest[]>([])
    const [loading, setLoading] = useState(true)
    const [kyraBalance, setKyraBalance] = useState<string>("0")
    const [totalXP, setTotalXP] = useState(0)
    const [activeTab, setActiveTab] = useState<"history" | "inventory">("history")

    const wallet = wallets[0]

    const fetchProfile = useCallback(async () => {
        if (!wallet?.address) return

        setLoading(true)
        try {
            // Fetch claimed quests
            const { data, error } = await supabase
                .from("quest_claims")
                .select(`
                    id,
                    quest_id,
                    tx_hash,
                    xp_earned,
                    claimed_at,
                    quest:quests (
                        name,
                        description,
                        quest_type,
                        reward_per_claim,
                        address
                    )
                `)
                .eq("player_wallet", wallet.address.toLowerCase())
                .order("claimed_at", { ascending: false })

            if (error) throw error

            // Transform data - Supabase returns nested tables as arrays
            const transformedClaims: ClaimedQuest[] = (data || []).map((item: any) => ({
                ...item,
                quest: Array.isArray(item.quest) ? item.quest[0] : item.quest
            }))
            setClaims(transformedClaims)

            // Calculate total XP
            const xp = transformedClaims.reduce((sum, claim) => sum + (claim.xp_earned || 0), 0)
            setTotalXP(xp)

            // Fetch KYRA balance
            const ethereumProvider = await wallet.getEthereumProvider()
            const provider = new ethers.BrowserProvider(ethereumProvider)
            const kyraContract = new ethers.Contract(KYRA_TOKEN_ADDRESS, KYRAABI, provider)
            const balance = await kyraContract.balanceOf(wallet.address)
            setKyraBalance(ethers.formatUnits(balance, 18))

        } catch (err) {
            console.error("Error fetching profile:", err)
        } finally {
            setLoading(false)
        }
    }, [wallet?.address])

    useEffect(() => {
        if (wallet?.address) {
            fetchProfile()
        }
    }, [wallet?.address, fetchProfile])

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
                return { label: "🗺️ Map Hunt", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
            case "qr":
                return { label: "📱 QR Scan", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
            default:
                return { label: "✓ Identity", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" }
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getLevel = (xp: number) => {
        if (xp >= 10000) return { level: 10, title: "Quest Legend" }
        if (xp >= 5000) return { level: 8, title: "Quest Master" }
        if (xp >= 2500) return { level: 6, title: "Quest Hunter" }
        if (xp >= 1000) return { level: 4, title: "Quest Seeker" }
        if (xp >= 500) return { level: 3, title: "Adventurer" }
        if (xp >= 100) return { level: 2, title: "Explorer" }
        return { level: 1, title: "Newcomer" }
    }

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10" />
                </div>
                <Navigation />
                <div className="relative z-10 pt-32 px-4">
                    <div className="container mx-auto max-w-2xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-12 rounded-3xl border border-white/10"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                <Wallet className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-4">Your Profile</h1>
                            <p className="text-gray-400 mb-8 text-lg">Connect your wallet to view your quest history and rewards.</p>
                            <Button
                                onClick={login}
                                size="lg"
                                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Connect Wallet
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        )
    }

    const levelInfo = getLevel(totalXP)

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[128px]" />
            </div>

            <Navigation />

            <div className="relative z-10 pt-28 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Profile Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Card className="p-8 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-3xl">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
                                        {levelInfo.level}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-violet-500 rounded-lg text-xs font-bold text-white">
                                        LVL {levelInfo.level}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-3xl font-bold text-white mb-1">{levelInfo.title}</h1>
                                    <p className="text-gray-400 font-mono text-sm mb-4">
                                        {wallet?.address?.slice(0, 6)}...{wallet?.address?.slice(-4)}
                                    </p>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-violet-400" />
                                                <span className="text-violet-400 font-bold">{totalXP.toLocaleString()} XP</span>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30">
                                            <div className="flex items-center gap-2">
                                                <Coins className="w-4 h-4 text-green-400" />
                                                <span className="text-green-400 font-bold">{Number(kyraBalance).toLocaleString()} KYRA</span>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-4 h-4 text-blue-400" />
                                                <span className="text-blue-400 font-bold">{claims.length} Quests</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === "history" ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                            Quest History
                        </button>
                        <button
                            onClick={() => setActiveTab("inventory")}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === "inventory" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                        >
                            <Package className="w-4 h-4" />
                            Inventory
                        </button>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === "history" ? (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">Completed Quests</h2>
                                    <Link href="/quests">
                                        <Button variant="outline" className="bg-transparent border-white/10">
                                            Find More Quests <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                                    </div>
                                ) : claims.length === 0 ? (
                                    <Card className="p-12 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border-white/10 rounded-2xl text-center">
                                        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white mb-2">No Quests Completed Yet</h3>
                                        <p className="text-gray-400 mb-6">Start claiming quests to earn rewards and XP!</p>
                                        <Link href="/quests">
                                            <Button className="bg-gradient-to-r from-violet-500 to-purple-500">
                                                Explore Quests
                                            </Button>
                                        </Link>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {claims.map((claim, index) => {
                                            const questType = getQuestTypeBadge(claim.quest?.quest_type || "verification")
                                            return (
                                                <motion.div
                                                    key={claim.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <Card className="p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border-white/10 rounded-2xl hover:border-violet-500/30 transition-all">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-white">{claim.quest?.name || "Unknown Quest"}</h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge className={`${questType.color} border text-xs`}>
                                                                            {questType.label}
                                                                        </Badge>
                                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {formatDate(claim.claimed_at)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xl font-bold text-white">
                                                                    +{formatReward(claim.quest?.reward_per_claim || "0")}
                                                                </div>
                                                                <div className="text-xs text-violet-400">KYRA</div>
                                                                <div className="text-xs text-gray-500 mt-1">+{claim.xp_earned} XP</div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="inventory"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">Quest Artifacts</h2>
                                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                        {claims.length} Collected
                                    </Badge>
                                </div>

                                {claims.length === 0 ? (
                                    <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                        <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500">Your inventory is empty. Complete quests to earn artifacts!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                        {claims.map((claim, index) => (
                                            <motion.div
                                                key={claim.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card className="aspect-square bg-gradient-to-br from-white/[0.08] to-white/[0.01] border-white/10 flex flex-col items-center justify-center p-4 group relative overflow-hidden hover:border-blue-500/50 transition-all cursor-help">
                                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 group-hover:scale-110 transition-transform">
                                                        <Trophy className="w-8 h-8 text-white opacity-80" />
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs font-black text-white uppercase tracking-tighter line-clamp-1">{claim.quest?.name}</div>
                                                        <div className="text-[10px] text-blue-400 font-bold">LEGACY</div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
