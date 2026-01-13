"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, Loader2, Coins, Users, Calendar, ArrowRight, Sparkles, Filter, Trophy, ShieldCheck, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { ethers } from "ethers"
import { motion, AnimatePresence } from "framer-motion"

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
    is_verified_merchant: boolean
    is_boosted: boolean
    nft_gate_address: string | null
}

export default function QuestsPage() {
    const [quests, setQuests] = useState<Quest[]>([])
    const [filteredQuests, setFilteredQuests] = useState<Quest[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<string | null>(null)

    useEffect(() => {
        fetchQuests()
    }, [])

    useEffect(() => {
        let results = quests

        // Apply search filter
        if (searchQuery) {
            results = results.filter(q =>
                q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Apply type filter
        if (typeFilter) {
            results = results.filter(q => q.quest_type === typeFilter)
        }

        setFilteredQuests(results)
    }, [quests, searchQuery, typeFilter])

    const fetchQuests = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("quests")
                .select("*")
                .eq("is_active", true)
                .order("is_boosted", { ascending: false })
                .order("created_at", { ascending: false })

            if (error) throw error
            setQuests(data || [])
        } catch (err) {
            console.error("Error fetching quests:", err)
        } finally {
            setLoading(false)
        }
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
            case "social":
                return { label: "🐦 Social", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", gradient: "from-blue-400 to-blue-600" }
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
            month: "short",
            day: "numeric"
        })
    }

    const activeQuests = quests.filter(q => q.is_active && !isExpired(q.expiry_timestamp))
    const totalClaims = quests.reduce((acc, q) => acc + (q.claims_made || 0), 0)
    const totalRewards = quests.reduce((acc, q) => {
        try {
            return acc + Number(ethers.formatUnits(q.reward_per_claim, 18)) * q.claims_made
        } catch {
            return acc
        }
    }, 0)

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
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
                            <Trophy className="w-4 h-4" />
                            {quests.length} Quests Available
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                            Explore <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Quests</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            Discover and complete quests to earn KYRA tokens on Mantle Network
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
                    >
                        <Card className="p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Active Quests</p>
                                    <p className="text-3xl font-bold text-white">{activeQuests.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Claims</p>
                                    <p className="text-3xl font-bold text-white">{totalClaims.toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                    <Coins className="w-6 h-6 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">KYRA Distributed</p>
                                    <p className="text-3xl font-bold text-white">{totalRewards.toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Search and Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-4 mb-8"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input
                                type="text"
                                placeholder="Search quests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setTypeFilter(null)}
                                variant={typeFilter === null ? "default" : "outline"}
                                className={`rounded-xl ${typeFilter === null ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-transparent border-white/10"}`}
                            >
                                All
                            </Button>
                            <Button
                                onClick={() => setTypeFilter("map")}
                                variant={typeFilter === "map" ? "default" : "outline"}
                                className={`rounded-xl ${typeFilter === "map" ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-transparent border-white/10"}`}
                            >
                                🗺️ Map
                            </Button>
                            <Button
                                onClick={() => setTypeFilter("qr")}
                                variant={typeFilter === "qr" ? "default" : "outline"}
                                className={`rounded-xl ${typeFilter === "qr" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-transparent border-white/10"}`}
                            >
                                📱 QR
                            </Button>
                            <Button
                                onClick={() => setTypeFilter("social")}
                                variant={typeFilter === "social" ? "default" : "outline"}
                                className={`rounded-xl ${typeFilter === "social" ? "bg-gradient-to-r from-blue-400 to-blue-600" : "bg-transparent border-white/10"}`}
                            >
                                🐦 Social
                            </Button>
                            <Button
                                onClick={() => setTypeFilter("verification")}
                                variant={typeFilter === "verification" ? "default" : "outline"}
                                className={`rounded-xl ${typeFilter === "verification" ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-transparent border-white/10"}`}
                            >
                                ✓ Identity
                            </Button>
                        </div>
                    </motion.div>

                    {/* Quest Grid */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                                </div>
                                <p className="text-gray-400 mt-4">Loading quests...</p>
                            </motion.div>
                        ) : filteredQuests.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-20"
                            >
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                                    <Search className="w-10 h-10 text-violet-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">No Quests Found</h3>
                                <p className="text-gray-400">Try adjusting your search or filters</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="quests"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredQuests.map((quest, index) => {
                                    const typeBadge = getQuestTypeBadge(quest.quest_type)
                                    const expired = isExpired(quest.expiry_timestamp)
                                    const progress = quest.max_claims > 0 ? (quest.claims_made / quest.max_claims) * 100 : 0

                                    return (
                                        <motion.div
                                            key={quest.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link href={`/quest/${quest.address}`}>
                                                <Card className="flex flex-col bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 hover:border-violet-500/30 transition-all rounded-3xl group cursor-pointer h-full overflow-hidden">
                                                    {/* Image Banner */}
                                                    <div className="relative h-48 w-full overflow-hidden">
                                                        {quest.image_url ? (
                                                            <img
                                                                src={quest.image_url}
                                                                alt={quest.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className={`w-full h-full bg-gradient-to-br ${typeBadge.gradient} opacity-20`} />
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-60" />

                                                        <div className="absolute top-4 left-4 flex gap-2">
                                                            <Badge className={`${typeBadge.color} border backdrop-blur-md font-bold uppercase tracking-wider text-[10px]`}>
                                                                {typeBadge.label}
                                                            </Badge>
                                                        </div>
                                                        {quest.is_verified_merchant && (
                                                            <div className="absolute top-4 left-4 z-20">
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-full">
                                                                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">Verified</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {quest.is_boosted && (
                                                            <div className="absolute top-4 right-4 z-20">
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500 text-black rounded-full shadow-lg shadow-yellow-500/20 animate-pulse">
                                                                    <Sparkles className="w-3.5 h-3.5" />
                                                                    <span className="text-[10px] font-black uppercase tracking-wider">Boosted</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {quest.nft_gate_address && (
                                                            <div className="absolute bottom-4 left-4 z-20">
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 rounded-full">
                                                                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                                                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">NFT Gated</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-4 right-4">
                                                            {expired ? (
                                                                <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-md">
                                                                    Expired
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-md">
                                                                    Active
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="p-6 flex-1 flex flex-col">
                                                        {/* Title */}
                                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                                                            {quest.name}
                                                        </h3>

                                                        {/* Description */}
                                                        {quest.description && (
                                                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{quest.description}</p>
                                                        )}

                                                        {/* Reward */}
                                                        <div className="flex items-baseline gap-2 mb-4">
                                                            <span className="text-3xl font-bold text-white">{formatReward(quest.reward_per_claim)}</span>
                                                            <span className="text-violet-400 font-medium">KYRA</span>
                                                        </div>

                                                        {/* Progress */}
                                                        <div className="mb-4">
                                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                                <span>{quest.claims_made} claims</span>
                                                                <span>{quest.max_claims} max</span>
                                                            </div>
                                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full bg-gradient-to-r ${typeBadge.gradient} rounded-full transition-all`}
                                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between text-sm mt-auto">
                                                            <span className="text-gray-500">
                                                                Expires {formatDate(quest.expiry_timestamp)}
                                                            </span>
                                                            <span className="text-violet-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                                                View <ArrowRight className="w-4 h-4" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Link>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
