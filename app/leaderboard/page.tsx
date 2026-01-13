"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Trophy, Star, Medal, Crown, TrendingUp, Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Player {
    wallet_address: string
    xp: number
    level: number
    quests_completed: number
}

export default function LeaderboardPage() {
    const [players, setPlayers] = useState<Player[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchLeaderboard()
    }, [])

    const fetchLeaderboard = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("players")
                .select("*")
                .order("xp", { ascending: false })
                .limit(100)

            if (error) throw error
            setPlayers(data || [])
        } catch (err) {
            console.error("Error fetching leaderboard:", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredPlayers = players.filter(p =>
        p.wallet_address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="w-6 h-6 text-yellow-500" />
            case 1: return <Medal className="w-6 h-6 text-gray-400" />
            case 2: return <Medal className="w-6 h-6 text-orange-400" />
            default: return <span className="text-gray-500 font-mono font-bold">{index + 1}</span>
        }
    }

    const getPlayerColor = (index: number) => {
        switch (index) {
            case 0: return "border-yellow-500/50 bg-yellow-500/5 shadow-yellow-500/10 shadow-lg"
            case 1: return "border-gray-400/50 bg-gray-400/5 shadow-gray-400/10 shadow-lg"
            case 2: return "border-orange-400/50 bg-orange-400/5 shadow-orange-400/10 shadow-lg"
            default: return "border-white/10 bg-white/[0.02]"
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[128px]" />
            </div>

            <Navigation />

            <div className="relative z-10 pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-12 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-bold uppercase tracking-widest"
                        >
                            <Trophy className="w-4 h-4" />
                            Global Ranking
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">Hall of <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Fame</span></h1>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">
                            The top hunters on the Mantle Network. Earn XP to climb the ranks.
                        </p>
                    </div>

                    {/* Top 3 Podium (Optional: could add more visual here) */}

                    {/* List */}
                    <Card className="bg-white/[0.03] border-white/10 rounded-[32px] overflow-hidden p-2">
                        <div className="p-4 border-b border-white/5 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search hunter by wallet..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 bg-white/5 border-none rounded-2xl pl-12 pr-4 text-white text-sm placeholder:text-gray-600 focus:ring-1 focus:ring-violet-500 focus:bg-white/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] text-gray-500 uppercase font-black tracking-widest border-b border-white/5">
                                        <th className="px-8 py-6 text-left w-20">Rank</th>
                                        <th className="px-6 py-6 text-left">Hunter</th>
                                        <th className="px-6 py-6 text-center">XP</th>
                                        <th className="px-6 py-6 text-center">Level</th>
                                        <th className="px-6 py-6 text-right">Quests</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
                                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Leaderboard...</p>
                                            </td>
                                        </tr>
                                    ) : filteredPlayers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center text-gray-500">
                                                No hunters found match this address.
                                            </td>
                                        </tr>
                                    ) : filteredPlayers.map((player, index) => (
                                        <tr key={index} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center w-8">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-500/20">
                                                        {player.wallet_address.slice(2, 4).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-bold group-hover:text-violet-400 transition-colors">
                                                            {player.wallet_address.slice(0, 6)}...{player.wallet_address.slice(-4)}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Hunter</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-white font-black">{player.xp.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <Badge className="bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                                    LVL {player.level}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-gray-400 font-bold">
                                                    <TrendingUp className="w-4 h-4" />
                                                    {player.quests_completed}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <div className="mt-8 text-center bg-white/[0.02] border border-white/5 p-8 rounded-[32px]">
                        <h3 className="text-white font-bold mb-2">How to climb the leaderboard?</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                            Complete active quests, scan QR codes, and visit on-map locations. Each completion awards XP based on the quest difficulty!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
