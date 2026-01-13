"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useState } from "react"
import { Map, QrCode, CheckCircle2, ArrowLeft, ArrowRight, Loader2, Rocket, Coins, Calendar, Users, Sparkles, Shield, Zap, Trophy, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ethers } from "ethers"
import { QUEST_FACTORY_ADDRESS, KYRA_TOKEN_ADDRESS } from "@/lib/constants"
import QuestFactoryABI from "@/contracts/abis/QuestFactory.json"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

type QuestType = "map" | "qr" | "verification" | null

export default function CreateQuestPage() {
  const router = useRouter()
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [step, setStep] = useState(1)
  const [questType, setQuestType] = useState<QuestType>(null)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const [questData, setQuestData] = useState({
    name: "",
    description: "",
    expiry: "",
    maxClaims: "100",
    rewardAmount: "10",
  })

  const wallet = wallets[0]

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* Animated background */}
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
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Launch Your Quest</h1>
              <p className="text-gray-400 mb-8 text-lg">Connect your wallet to start creating rewarding experiences for your community.</p>
              <Button
                onClick={login}
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-lg px-10 py-6 h-auto rounded-2xl shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105"
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

  const handleNext = () => {
    if (step === 1 && !questType) return
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!wallet) return toast.error("Wallet not connected")

    setLoading(true)
    try {
      const ethereumProvider = await wallet.getEthereumProvider()
      const provider = new ethers.BrowserProvider(ethereumProvider)
      const signer = await provider.getSigner()

      const factory = new ethers.Contract(QUEST_FACTORY_ADDRESS, QuestFactoryABI, signer)

      const rewardPerClaim = ethers.parseUnits(questData.rewardAmount, 18)
      const maxClaims = BigInt(questData.maxClaims)
      const expiryTimestamp = BigInt(Math.floor(new Date(questData.expiry).getTime() / 1000))

      console.log("Creating quest on-chain...")
      const tx = await factory.createQuest(
        KYRA_TOKEN_ADDRESS,
        rewardPerClaim,
        maxClaims,
        expiryTimestamp
      )

      setTxHash(tx.hash)
      toast.info("Transaction submitted. Waiting for confirmation...")

      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      const event = receipt.logs
        .map((log: any) => {
          try {
            return factory.interface.parseLog(log)
          } catch {
            return null
          }
        })
        .find((e: any) => e && e.name === "QuestCreated")

      if (!event) throw new Error("QuestCreated event not found")

      const questAddress = event.args.questAddress
      console.log("New Quest Address:", questAddress)

      const { error: sbError } = await supabase.from("quests").insert({
        address: questAddress,
        name: questData.name,
        description: questData.description,
        quest_type: questType,
        reward_token: KYRA_TOKEN_ADDRESS,
        reward_per_claim: rewardPerClaim.toString(),
        max_claims: Number(maxClaims),
        expiry_timestamp: Number(expiryTimestamp),
        creator: wallet.address
      })

      if (sbError) {
        console.error("Supabase Error:", sbError)
        toast.warning("Quest created on-chain but failed to save to database. Address: " + questAddress)
      } else {
        toast.success("Quest launched successfully!")
      }

      router.push("/launch/dashboard")
    } catch (err: any) {
      console.error("Deployment error:", err)
      toast.error(err.message || "Failed to launch quest")
    } finally {
      setLoading(false)
    }
  }

  const questTypes = [
    {
      id: "map" as const,
      title: "Map Hunt",
      description: "Geo-fenced treasure hunt with real-world goals",
      icon: Map,
      gradient: "from-orange-500 to-red-500",
      features: ["Location-based", "GPS verification", "Physical presence"]
    },
    {
      id: "qr" as const,
      title: "QR Scan",
      description: "In-person redemption via unique QR codes",
      icon: QrCode,
      gradient: "from-purple-500 to-pink-500",
      features: ["Scannable codes", "Event-based", "Instant rewards"]
    },
    {
      id: "verification" as const,
      title: "Identity Quest",
      description: "Social and identity-based verification rewards",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-cyan-500",
      features: ["Social proof", "KYC verified", "Sybil resistant"]
    }
  ]

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
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Deploy in minutes
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
              Create a <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Quest</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Design engaging quests and reward your community with KYRA tokens on Mantle Network
            </p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[
              { num: 1, label: "Type" },
              { num: 2, label: "Details" },
              { num: 3, label: "Launch" }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <motion.div
                  className={`relative flex flex-col items-center`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-500 ${step >= s.num
                    ? "bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/30"
                    : "bg-white/5 text-gray-500 border border-white/10"
                    }`}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${step >= s.num ? "text-violet-400" : "text-gray-500"}`}>
                    {s.label}
                  </span>
                </motion.div>
                {i < 2 && (
                  <div className={`w-16 h-0.5 mx-3 rounded transition-all duration-500 ${step > s.num ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-white/10"
                    }`} />
                )}
              </div>
            ))}
          </div>

          {/* Main Card */}
          <Card className="p-0 overflow-hidden rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-2xl">
            <div className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                {/* Step 1: Select Quest Type */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-white">Choose Your Quest Type</h2>
                      <p className="text-gray-400 text-lg">Select the verification method that best fits your campaign</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {questTypes.map((type) => {
                        const Icon = type.icon
                        const isSelected = questType === type.id
                        return (
                          <motion.button
                            key={type.id}
                            onClick={() => setQuestType(type.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`group relative p-6 rounded-2xl border-2 transition-all text-left ${isSelected
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05]"
                              }`}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="selectedBorder"
                                className="absolute inset-0 rounded-2xl border-2 border-violet-500"
                              />
                            )}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                              <Icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                            <p className="text-sm text-gray-400 mb-4">{type.description}</p>
                            <div className="space-y-2">
                              {type.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                                  <CheckCircle2 className="w-3 h-3 text-violet-500" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                            {isSelected && (
                              <div className="absolute top-4 right-4">
                                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Configure Quest */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-white">Quest Configuration</h2>
                      <p className="text-gray-400 text-lg">Define the rules and rewards for your quest</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="name" className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-violet-500" />
                            Quest Name
                          </Label>
                          <Input
                            id="name"
                            value={questData.name}
                            onChange={(e) => setQuestData({ ...questData, name: e.target.value })}
                            placeholder="e.g. Mantle Explorer Hunt"
                            className="bg-white/5 border-white/10 rounded-xl h-14 px-5 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20 transition-all"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="description" className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Star className="w-4 h-4 text-violet-500" />
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={questData.description}
                            onChange={(e) => setQuestData({ ...questData, description: e.target.value })}
                            placeholder="What do players need to do to complete this quest?"
                            className="bg-white/5 border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500/20 transition-all min-h-[140px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="expiry" className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-violet-500" />
                            Expiry Date
                          </Label>
                          <Input
                            id="expiry"
                            type="date"
                            value={questData.expiry}
                            onChange={(e) => setQuestData({ ...questData, expiry: e.target.value })}
                            className="bg-white/5 border-white/10 rounded-xl h-14 px-5 text-white [color-scheme:dark] focus:border-violet-500 focus:ring-violet-500/20 transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label htmlFor="maxClaims" className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-4 h-4 text-violet-500" />
                              Max Claims
                            </Label>
                            <Input
                              id="maxClaims"
                              type="number"
                              value={questData.maxClaims}
                              onChange={(e) => setQuestData({ ...questData, maxClaims: e.target.value })}
                              className="bg-white/5 border-white/10 rounded-xl h-14 px-5 text-white focus:border-violet-500 focus:ring-violet-500/20 transition-all"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="reward" className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                              <Coins className="w-4 h-4 text-violet-500" />
                              Reward
                            </Label>
                            <div className="relative">
                              <Input
                                id="reward"
                                type="number"
                                value={questData.rewardAmount}
                                onChange={(e) => setQuestData({ ...questData, rewardAmount: e.target.value })}
                                className="bg-white/5 border-white/10 rounded-xl h-14 px-5 pr-16 text-white focus:border-violet-500 focus:ring-violet-500/20 transition-all"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-500 font-bold text-sm">
                                KYRA
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Budget Summary Card */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm font-medium">Total Budget Required</span>
                            <Shield className="w-4 h-4 text-violet-500" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-white">
                              {(Number(questData.maxClaims) * Number(questData.rewardAmount)).toLocaleString()}
                            </span>
                            <span className="text-violet-500 font-bold">KYRA</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Fund the quest vault after launching</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review & Launch */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-3">
                      <h2 className="text-3xl font-bold text-white">Ready to Launch?</h2>
                      <p className="text-gray-400 text-lg">Review your quest configuration before deploying to Mantle</p>
                    </div>

                    <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-3xl border border-white/10 p-8 space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-3xl font-bold text-white">{questData.name || "Untitled Quest"}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${questType === "map" ? "bg-orange-500/20 text-orange-400" :
                              questType === "qr" ? "bg-purple-500/20 text-purple-400" :
                                "bg-violet-500/20 text-violet-400"
                              }`}>
                              {questType === "map" ? "🗺️ Map Hunt" : questType === "qr" ? "📱 QR Scan" : "✓ Identity"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-5xl font-extrabold text-white">{questData.rewardAmount}</div>
                          <div className="text-violet-500 font-bold">KYRA per claim</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 py-6 border-y border-white/10">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{questData.maxClaims}</div>
                          <div className="text-xs text-gray-500 uppercase font-medium mt-1">Max Claims</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{questData.expiry || "—"}</div>
                          <div className="text-xs text-gray-500 uppercase font-medium mt-1">Expiry Date</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-violet-400">
                            {(Number(questData.maxClaims) * Number(questData.rewardAmount)).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 uppercase font-medium mt-1">Total Budget</div>
                        </div>
                      </div>

                      <p className="text-gray-400 italic">"{questData.description || "No description provided."}"</p>
                    </div>

                    {loading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 pt-4"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                          <Rocket className="w-6 h-6 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <p className="text-violet-400 font-medium">Deploying to Mantle Network...</p>
                        {txHash && (
                          <a
                            href={`https://explorer.sepolia.mantle.xyz/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-violet-400 underline transition-colors"
                          >
                            View Transaction →
                          </a>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/10">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={step === 1 || loading}
                  className="gap-2 rounded-xl px-6 h-12 bg-transparent hover:bg-white/5 border-white/10 text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={step === 1 && !questType}
                    className="gap-2 rounded-xl px-8 h-12 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="gap-2 rounded-xl px-10 h-14 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-extrabold text-lg transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105"
                  >
                    {!loading ? (
                      <>
                        <Rocket className="w-5 h-5" />
                        Launch Quest
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Deploying...
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-10 text-gray-500 text-sm"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Secured by Mantle
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Gas Optimized
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-700" />
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Audited Contracts
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
