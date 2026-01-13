"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Smartphone, Apple, PlayCircle, Download, ShieldCheck, Zap, Globe, ArrowRight } from "lucide-react"

export default function DownloadPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
            {/* Background gradients */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]" />
            </div>

            <Navigation />

            <div className="relative z-10 pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left side: Text & Actions */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold uppercase tracking-widest"
                            >
                                <Smartphone className="w-4 h-4" />
                                Mobile Beta Now Live
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-6xl md:text-7xl font-black text-white leading-tight tracking-tight"
                            >
                                KyraQuest <br />
                                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                    In Your Pocket.
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-gray-400 max-w-lg leading-relaxed"
                            >
                                Scan QRs, hunt for treasures on the map, and earn real-world rewards on the go. Download the beta today.
                            </motion.p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button className="h-16 px-8 bg-white text-black hover:bg-gray-200 transition-all rounded-2xl flex items-center gap-4 group">
                                    <div className="bg-black/5 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                        <Download className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase font-bold text-gray-500 leading-none">Download</div>
                                        <div className="text-lg font-black leading-none mt-1">Direct APK</div>
                                    </div>
                                </Button>

                                <div className="flex gap-4">
                                    <Card className="flex-1 p-4 bg-white/5 border-white/10 rounded-2xl opacity-50 cursor-not-allowed">
                                        <div className="flex items-center gap-3">
                                            <Apple className="w-6 h-6 text-white/40" />
                                            <div className="text-left">
                                                <div className="text-[10px] uppercase font-bold text-gray-400">Soon on</div>
                                                <div className="text-sm font-bold text-white/40">App Store</div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="flex-1 p-4 bg-white/5 border-white/10 rounded-2xl opacity-50 cursor-not-allowed">
                                        <div className="flex items-center gap-3">
                                            <PlayCircle className="w-6 h-6 text-white/40" />
                                            <div className="text-left">
                                                <div className="text-[10px] uppercase font-bold text-gray-400">Soon on</div>
                                                <div className="text-sm font-bold text-white/40">Play Store</div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                                <div className="flex gap-3">
                                    <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                                    <div>
                                        <h3 className="text-white font-bold text-sm">Verified APK</h3>
                                        <p className="text-gray-500 text-xs">Safe & secure binary</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Zap className="w-5 h-5 text-violet-400 shrink-0" />
                                    <div>
                                        <h3 className="text-white font-bold text-sm">Low Latency</h3>
                                        <p className="text-gray-500 text-xs">Optimized for Mantle</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side: App Mockup / Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-violet-600/20 blur-[100px] rounded-full" />
                            <div className="relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 rounded-[48px] p-4 shadow-2xl">
                                <div className="bg-[#0a0a0f] rounded-[36px] overflow-hidden aspect-[9/19.5] border-4 border-[#1a1a24] shadow-inner relative">
                                    {/* Status Bar */}
                                    <div className="h-10 w-full flex justify-between items-center px-6 pt-2">
                                        <span className="text-[10px] font-bold text-white">9:41</span>
                                        <div className="flex gap-1.5">
                                            <div className="w-3.5 h-3.5 rounded-full border border-white/30" />
                                            <div className="w-3.5 h-3.5 rounded-full border border-white/30" />
                                        </div>
                                    </div>

                                    {/* App Content Preview */}
                                    <div className="p-6 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="w-10 h-10 rounded-xl bg-violet-500/20" />
                                            <div className="px-3 py-1 rounded-full bg-violet-500/20 text-[10px] text-violet-400 font-bold">STREAK: 5 🔥</div>
                                        </div>

                                        <div className="h-48 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center p-8 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                                            <div className="text-center z-10">
                                                <div className="text-[10px] font-bold text-white/60 mb-1 uppercase tracking-wider">Active Balance</div>
                                                <div className="text-3xl font-black text-white">1,450.00</div>
                                                <div className="text-[10px] font-bold text-violet-200">KYRA TOKENS</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Active Quests Near You</p>
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5" />
                                                    <div className="flex-1">
                                                        <div className="w-20 h-2 bg-white/20 rounded-full mb-2" />
                                                        <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-white/20" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom Nav */}
                                    <div className="absolute bottom-0 inset-x-0 h-20 bg-black/40 backdrop-blur-md border-t border-white/5 flex justify-around items-center px-6">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/20" />
                                        <div className="w-8 h-8 rounded-lg bg-white/10" />
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500 shadow-lg shadow-violet-500/50 flex items-center justify-center">
                                            <Globe className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-white/10" />
                                        <div className="w-8 h-8 rounded-lg bg-white/10" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
