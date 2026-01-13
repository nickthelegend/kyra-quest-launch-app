"use client"

import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Map as MapIcon, Search, Filter, Layers, Navigation as NavIcon, Target, ShieldCheck, Trophy } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface MapQuest {
    id: string
    address: string
    name: string
    quest_type: string
    is_verified_merchant: boolean
    reward_per_claim: string
}

export default function MapExplorerPage() {
    const [quests, setQuests] = useState<MapQuest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedQuest, setSelectedQuest] = useState<MapQuest | null>(null)

    useEffect(() => {
        fetchQuests()
    }, [])

    const fetchQuests = async () => {
        setLoading(true)
        try {
            const { data } = await supabase
                .from("quests")
                .select("id, address, name, quest_type, is_verified_merchant, reward_per_claim")
                .limit(20)

            setQuests(data || [])
        } catch (err) {
            console.error("Error fetching map quests:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-screen bg-[#0a0a0f] relative overflow-hidden flex flex-col">
            <Navigation />

            {/* Map UI Overlay */}
            <div className="flex-1 relative mt-16">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-[#0a0a0f]">
                    <div className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

                    {/* Mock Clusters */}
                    <div className="absolute top-1/2 left-1/3">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            className="bg-violet-600/30 backdrop-blur-md border border-violet-500/50 w-24 h-24 rounded-full flex items-center justify-center cursor-pointer group shadow-2xl shadow-violet-500/20"
                        >
                            <div className="bg-violet-500 w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-xl">
                                4
                            </div>
                            <div className="absolute -top-10 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-black text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                DOWNTOWN CLUSTER
                            </div>
                        </motion.div>
                    </div>

                    <div className="absolute top-1/4 right-1/4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            className="bg-blue-600/30 backdrop-blur-md border border-blue-500/50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer group shadow-2xl shadow-blue-500/20"
                        >
                            <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center font-black text-white">
                                2
                            </div>
                        </motion.div>
                    </div>

                    {/* Single Quest Pins */}
                    {quests.map((quest, i) => (
                        <motion.div
                            key={quest.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                left: `${20 + (i * 15) % 60}%`,
                                top: `${30 + (i * 10) % 50}%`
                            }}
                            className="absolute cursor-pointer group"
                            onClick={() => setSelectedQuest(quest)}
                        >
                            <div className="relative">
                                <Target className="w-8 h-8 text-violet-400 group-hover:scale-125 transition-transform drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                                {quest.is_verified_merchant && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-white/20">
                                        <ShieldCheck className="w-2 h-2 text-white" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="absolute top-6 left-6 right-6 md:left-12 md:right-auto md:w-96 z-20">
                    <Card className="bg-black/60 backdrop-blur-xl border-white/10 p-2 rounded-2xl shadow-2xl">
                        <div className="flex items-center gap-2">
                            <div className="pl-3">
                                <Search className="w-5 h-5 text-gray-500" />
                            </div>
                            <input
                                placeholder="Search city or quest..."
                                className="bg-transparent border-none outline-none text-white text-sm w-full h-10 placeholder:text-gray-600"
                            />
                            <Button size="icon" variant="ghost" className="rounded-xl hover:bg-white/10">
                                <Filter className="w-5 h-5 text-gray-400" />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Left Panel - Quest Details (Sticky) */}
                <AnimatePresence>
                    {selectedQuest && (
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            className="absolute bottom-6 left-6 right-6 md:top-24 md:left-12 md:bottom-auto md:w-96 z-20"
                        >
                            <Card className="bg-[#0a0a0f]/80 backdrop-blur-2xl border-white/10 overflow-hidden rounded-[32px] shadow-2xl">
                                <div className="h-32 bg-gradient-to-br from-violet-600 to-indigo-900 relative">
                                    <button
                                        onClick={() => setSelectedQuest(null)}
                                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md text-white transition-colors"
                                    >
                                        <NavIcon className="w-4 h-4 rotate-45" />
                                    </button>
                                    <div className="absolute bottom-4 left-6">
                                        <Badge className="bg-white/20 backdrop-blur-md border-white/20 mb-2">
                                            {selectedQuest.quest_type.toUpperCase()}
                                        </Badge>
                                        <h3 className="text-xl font-bold text-white">{selectedQuest.name}</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                            <span className="text-white font-bold">100 KYRA</span>
                                        </div>
                                        {selectedQuest.is_verified_merchant && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-[10px] font-black text-blue-400 uppercase">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                    <Link href={`/quest/${selectedQuest.address}`} className="block">
                                        <Button className="w-full h-14 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold group">
                                            Start Tracking
                                            <NavIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Control Panel (Bottom Right) */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-20">
                    <Button size="icon" className="w-14 h-14 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-white/5 shadow-2xl">
                        <Layers className="w-6 h-6" />
                    </Button>
                    <Button size="icon" className="w-14 h-14 rounded-2xl bg-violet-600 text-white hover:bg-violet-700 shadow-2xl shadow-violet-600/30">
                        <NavIcon className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
