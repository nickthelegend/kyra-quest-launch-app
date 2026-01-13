"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import Link from "next/link"
import { Plus, Pause, Play, StopCircle, Loader2, RefreshCw, ExternalLink, Coins, Users, Calendar, AlertCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
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
}

export default function DashboardPage() {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const wallet = wallets[0]

  const fetchQuests = useCallback(async () => {
    if (!wallet?.address) return

    setLoading(true)
    setError(null)

    try {
      console.log("Fetching quests for wallet:", wallet.address)

      const { data, error: sbError } = await supabase
        .from("quests")
        .select("*")
        .eq("creator", wallet.address.toLowerCase())
        .order("created_at", { ascending: false })

      console.log("Supabase response:", { data, error: sbError })

      if (sbError) {
        console.error("Supabase error details:", JSON.stringify(sbError, null, 2))
        throw new Error(sbError.message || "Supabase query failed")
      }

      // Also try with original case if no results
      if (!data || data.length === 0) {
        console.log("No results with lowercase, trying original case...")
        const { data: data2, error: sbError2 } = await supabase
          .from("quests")
          .select("*")
          .eq("creator", wallet.address)
          .order("created_at", { ascending: false })

        console.log("Second query response:", { data: data2, error: sbError2 })

        if (sbError2) {
          console.error("Supabase error details (2nd query):", JSON.stringify(sbError2, null, 2))
          throw new Error(sbError2.message || "Supabase query failed")
        }
        setQuests(data2 || [])
      } else {
        setQuests(data)
      }
    } catch (err: any) {
      console.error("Error fetching quests:", err)
      console.error("Error type:", typeof err)
      console.error("Error stringified:", JSON.stringify(err, Object.getOwnPropertyNames(err)))
      setError(err.message || err.toString() || "Failed to load quests")
    } finally {
      setLoading(false)
    }
  }, [wallet?.address])

  useEffect(() => {
    if (authenticated && wallet?.address) {
      fetchQuests()
    }
  }, [authenticated, wallet?.address, fetchQuests])

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
      case "verification":
      default:
        return { label: "✓ Identity", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" }
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

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <Navigation />
        <div className="relative z-10 pt-32 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Authentication Required</h1>
              <p className="text-gray-400 mb-8 text-lg">Please log in to view your merchant dashboard</p>
              <Button
                onClick={login}
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-lg px-10 py-6 h-auto rounded-2xl shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105"
              >
                Login with Privy
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

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
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                Merchant <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-gray-400 text-lg">Manage your quests and track rewards distribution</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchQuests}
                variant="outline"
                className="gap-2 rounded-xl bg-transparent border-white/10 hover:bg-white/5"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Link href="/launch/create">
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25">
                  <Plus className="w-4 h-4" />
                  Create Quest
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            <Card className="p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Quests</p>
                  <p className="text-3xl font-bold text-white">{quests.length}</p>
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
                  <p className="text-3xl font-bold text-white">{quests.reduce((acc, q) => acc + (q.claims_made || 0), 0)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active Quests</p>
                  <p className="text-3xl font-bold text-white">{quests.filter(q => q.is_active && !isExpired(q.expiry_timestamp)).length}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quest List */}
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
                <p className="text-gray-400 mt-4">Loading your quests...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={fetchQuests} variant="outline" className="bg-transparent">
                  Try Again
                </Button>
              </motion.div>
            ) : quests.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <Coins className="w-10 h-10 text-violet-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Quests Yet</h3>
                <p className="text-gray-400 mb-6">Create your first quest to start rewarding your community</p>
                <Link href="/launch/create">
                  <Button className="gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
                    <Plus className="w-4 h-4" />
                    Create Your First Quest
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="quests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {quests.map((quest, index) => {
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
                      <Card className="p-6 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 hover:border-violet-500/30 transition-all rounded-2xl group">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h3 className="text-xl font-bold text-white truncate">{quest.name}</h3>
                              <Badge className={`${typeBadge.color} border`}>
                                {typeBadge.label}
                              </Badge>
                              {expired ? (
                                <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                                  Expired
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

                            {quest.description && (
                              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{quest.description}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-6 text-sm">
                              <div>
                                <span className="text-gray-500">Claims: </span>
                                <span className="text-white font-medium">
                                  {quest.claims_made} / {quest.max_claims}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Reward: </span>
                                <span className="text-violet-400 font-medium">
                                  {formatReward(quest.reward_per_claim)} KYRA
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Expires: </span>
                                <span className={`font-medium ${expired ? "text-red-400" : "text-white"}`}>
                                  {formatDate(quest.expiry_timestamp)}
                                </span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4">
                              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% claimed</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link href={`/quest/${quest.address}`}>
                              <Button size="sm" variant="outline" className="gap-2 bg-transparent border-white/10 hover:bg-white/5">
                                <ExternalLink className="w-4 h-4" />
                                View
                              </Button>
                            </Link>
                            {quest.is_active && !expired ? (
                              <Button size="sm" variant="outline" className="gap-2 bg-transparent border-white/10 hover:bg-white/5">
                                <Pause className="w-4 h-4" />
                                Pause
                              </Button>
                            ) : !expired && (
                              <Button size="sm" variant="outline" className="gap-2 bg-transparent border-white/10 hover:bg-white/5">
                                <Play className="w-4 h-4" />
                                Resume
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10 bg-transparent"
                            >
                              <StopCircle className="w-4 h-4" />
                              End
                            </Button>
                          </div>
                        </div>
                      </Card>
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
