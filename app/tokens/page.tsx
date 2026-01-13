"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Coins, ExternalLink, ArrowUpRight, TrendingUp, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { ethers } from "ethers"
import Link from "next/link"

interface Token {
    id: string
    address: string
    name: string
    symbol: string
    decimals: number
    total_supply: string
    image: string | null
    creator: string
    created_at: string
}

export default function TokensExplorerPage() {
    const [tokens, setTokens] = useState<Token[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchTokens()
    }, [])

    const fetchTokens = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("tokens")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setTokens(data || [])
        } catch (err) {
            console.error("Error fetching tokens:", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredTokens = tokens.filter(token =>
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.address.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatSupply = (supply: string) => {
        try {
            return Number(ethers.formatUnits(supply, 18)).toLocaleString()
        } catch {
            return supply
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px]" />
            </div>

            <Navigation />

            <div className="relative z-10 pt-28 pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold uppercase tracking-wider">
                                <TrendingUp className="w-3 h-3" />
                                Token Launchpad
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                                Custom Tokens
                            </h1>
                            <p className="text-gray-400 text-lg max-w-xl">
                                Discover and explore community-created ERC20 tokens launched via KyraQuest.
                            </p>
                        </div>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <Input
                                placeholder="Search by name, symbol, or address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12 pr-6 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                            <p className="text-gray-500 animate-pulse">Scanning the Mantle network...</p>
                        </div>
                    ) : filteredTokens.length === 0 ? (
                        <div className="text-center py-32 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                                <Coins className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Tokens Found</h3>
                            <p className="text-gray-400">Be the first to create a custom token with your quest!</p>
                            <Link href="/launch/create">
                                <Button className="mt-6 bg-gradient-to-r from-violet-500 to-purple-500">
                                    Launch Your Token
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTokens.map((token, index) => (
                                <motion.div
                                    key={token.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group relative p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl hover:border-violet-500/50 transition-all duration-300">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/20 overflow-hidden">
                                                {token.image ? (
                                                    <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    token.symbol[0]
                                                )}
                                            </div>
                                            <a
                                                href={`https://explorer.sepolia.mantle.xyz/address/${token.address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">{token.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-mono text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded leading-none">
                                                    {token.symbol}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono">
                                                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/10">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Supply</p>
                                                <p className="text-sm font-bold text-white truncate">{formatSupply(token.total_supply)}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Launched</p>
                                                <p className="text-sm font-bold text-white truncate">
                                                    {new Date(token.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <Link href={`/launch/create?token=${token.address}`}>
                                            <Button className="w-full mt-4 bg-white/5 border border-white/10 hover:bg-violet-500 hover:border-violet-500 transition-all duration-300">
                                                Use in New Quest
                                                <ArrowUpRight className="ml-2 w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
