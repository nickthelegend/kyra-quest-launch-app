"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Map, QrCode, CheckCircle2, TrendingUp, Users, Award, Rocket, Sparkles, Coins, Zap, Shield, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4" />
            The Ultimate Quest Engine on Mantle
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tight leading-none"
          >
            Launch Quests, <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
              Earn Rewards.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto font-medium"
          >
            Build engaging experiences with map-based hunts, QR codes, and custom tokens. The most powerful reward distribution layer built on Mantle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/launch/create">
              <Button size="lg" className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 border-none shadow-xl shadow-violet-500/25 rounded-2xl group transition-all">
                <Rocket className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Launch Your First Quest
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -5 }} className="group">
              <Card className="p-8 h-full bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/10 rounded-3xl group-hover:border-violet-500/50 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Coins className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Token Launchpad</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  Create your own ERC20 tokens in seconds. We auto-mint and fund your quests instantly.
                </p>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="group">
              <Card className="p-8 h-full bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/10 rounded-3xl group-hover:border-fuchsia-500/50 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Map className="w-7 h-7 text-fuchsia-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Map-Based Hunts</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  Geo-fenced treasure hunts that bring players to real-world locations on our interactive map.
                </p>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="group">
              <Card className="p-8 h-full bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/10 rounded-3xl group-hover:border-blue-500/50 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <QrCode className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">QR Verification</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  Easy QR code redemptions for merchants and event organizers. Safe, fast, and on-chain.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-10 bg-white/[0.03] border-white/10 rounded-[32px] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center md:text-left space-y-2">
                <div className="text-5xl font-black text-white">$10.4M+</div>
                <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Total Value Locked</div>
              </div>
              <div className="text-center md:text-left space-y-2">
                <div className="text-5xl font-black text-white">450K+</div>
                <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Quest Claims</div>
              </div>
              <div className="text-center md:text-left space-y-2">
                <div className="text-5xl font-black text-white">12.8K</div>
                <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Verified Merchants</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Merchant Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-12 bg-gradient-to-br from-violet-600/20 to-purple-800/10 border-white/10 rounded-[48px] overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-violet-600/20 transition-all duration-700" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-black uppercase tracking-widest">
                  <Shield className="w-4 h-4" />
                  Merchant Hub
                </div>

                <h2 className="text-5xl font-black text-white leading-tight">
                  Drive Foot Traffic with <br />
                  <span className="text-blue-400">Verified Quests.</span>
                </h2>

                <p className="text-lg text-gray-400 leading-relaxed font-medium">
                  KYRA Verified Merchants get access to premium features including verified badges,
                  custom reward tokens, and deep geographical analytics. Bring customers to your door
                  through gamified treasure hunts.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-white font-bold">Verified Badge</h4>
                    <p className="text-sm text-gray-500">Official checkmark on all your quest listings.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-violet-400" />
                    </div>
                    <h4 className="text-white font-bold">Foot Traffic</h4>
                    <p className="text-sm text-gray-500">Incentivize real-world visits with tokens.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/launch/merchant">
                    <Button size="lg" className="h-14 px-8 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 group">
                      Become a Verified Merchant
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-violet-900/40 to-transparent blur-3xl" />
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Live Campaign</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">94% Claimed</Badge>
                  </div>
                  <div className="h-40 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-white opacity-20" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-white/20 rounded-full" />
                    <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                  </div>
                  <div className="pt-4 border-t border-white/5 flex gap-4">
                    <div className="flex-1 h-10 rounded-xl bg-blue-500/20" />
                    <div className="flex-1 h-10 rounded-xl bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="container mx-auto max-w-4xl space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Ready to grow your <br />
            <span className="text-violet-400">community?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Join thousands of brands building loyalty and engagement through gamified rewards on KyraQuest.
          </p>
          <div className="pt-8">
            <Link href="/launch/dashboard">
              <Button className="h-16 px-12 text-xl font-bold bg-white text-[#0a0a0f] hover:bg-gray-200 rounded-2xl group transition-all">
                Get Started Now
                <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-white/5 bg-black/20">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <img src="/icon-logo-text.png" alt="KyraQuest" className="h-8 w-auto invert opacity-50" />
          <div className="text-gray-500 text-sm font-medium">
            © 2025 KyraQuest. Built for the Mantle ecosystem.
          </div>
          <div className="flex items-center gap-8">
            <Link href="/help" className="text-gray-400 hover:text-white transition-colors text-sm font-bold">Docs</Link>
            <Link href="/tokens" className="text-gray-400 hover:text-white transition-colors text-sm font-bold">Tokens</Link>
            <Link href="/quests" className="text-gray-400 hover:text-white transition-colors text-sm font-bold">Quests</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
