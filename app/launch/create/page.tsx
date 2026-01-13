"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useState } from "react"
import { Map, QrCode, CheckCircle2, ArrowLeft, ArrowRight, Loader2, Rocket, Coins, Calendar, Users, Sparkles, Shield, Zap, Trophy, Star, PlusCircle, Image as ImageIcon, Upload, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ethers } from "ethers"
import { QUEST_FACTORY_ADDRESS, KYRA_TOKEN_ADDRESS, TOKEN_FACTORY_ADDRESS } from "@/lib/constants"
import QuestFactoryArtifact from "@/contracts/abis/QuestFactory.json"
import TokenFactoryArtifact from "@/contracts/abis/TokenFactory.json"
import QuestArtifact from "@/contracts/abis/Quest.json"
const QuestFactoryABI = QuestFactoryArtifact.abi
const TokenFactoryABI = TokenFactoryArtifact.abi
const QuestABI = QuestArtifact.abi
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { uploadToPinata } from "@/lib/pinata"

type QuestType = "map" | "qr" | "social" | "verification" | null

export default function CreateQuestPage() {
  const router = useRouter()
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [step, setStep] = useState(1)
  const [questType, setQuestType] = useState<QuestType>(null)
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [questImageUrl, setQuestImageUrl] = useState<string>("")

  // Token type: 'kyra' for KYRA token, 'custom' for new token
  const [tokenType, setTokenType] = useState<"kyra" | "custom">("kyra")
  const [customToken, setCustomToken] = useState({
    name: "",
    symbol: "",
    totalSupply: "1000000",
    image: "",
  })
  const [createdTokenAddress, setCreatedTokenAddress] = useState<string | null>(null)

  const [questData, setQuestData] = useState({
    name: "",
    description: "",
    expiry: "",
    maxClaims: "100",
    rewardAmount: "10",
    nftGateAddress: "",
    proofType: "none" as "none" | "ai_photo" | "social_post",
    isBoosted: false
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

      let rewardTokenAddress = KYRA_TOKEN_ADDRESS

      // Step 1: Create custom token if selected
      if (tokenType === "custom") {
        if (!TOKEN_FACTORY_ADDRESS) {
          throw new Error("Token Factory not deployed. Please deploy contracts first.")
        }

        toast.info("Creating your custom token...")
        const tokenFactory = new ethers.Contract(TOKEN_FACTORY_ADDRESS, TokenFactoryABI, signer)

        const totalSupply = ethers.parseUnits(customToken.totalSupply, 18)

        const tokenTx = await tokenFactory.createToken(
          customToken.name,
          customToken.symbol,
          18, // decimals
          totalSupply,
          customToken.image || ""
        )

        const tokenReceipt = await tokenTx.wait()

        // Find TokenCreated event
        const tokenEvent = tokenReceipt.logs
          .map((log: any) => {
            try {
              return tokenFactory.interface.parseLog(log)
            } catch {
              return null
            }
          })
          .find((e: any) => e && e.name === "TokenCreated")

        if (!tokenEvent) throw new Error("TokenCreated event not found")

        rewardTokenAddress = tokenEvent.args.tokenAddress
        setCreatedTokenAddress(rewardTokenAddress)
        toast.success(`Token ${customToken.symbol} created at ${rewardTokenAddress.slice(0, 10)}...`)

        // Save token to Supabase (ignore errors, quest is more important)
        try {
          await supabase.from("tokens").insert({
            address: rewardTokenAddress,
            name: customToken.name,
            symbol: customToken.symbol,
            decimals: 18,
            total_supply: totalSupply.toString(),
            image: customToken.image || null,
            creator: wallet.address.toLowerCase()
          })
        } catch (e) {
          console.error("Failed to save token to database:", e)
        }
      }

      // Step 2: Create the quest
      const factory = new ethers.Contract(QUEST_FACTORY_ADDRESS, QuestFactoryABI, signer)

      const rewardPerClaim = ethers.parseUnits(questData.rewardAmount, 18)
      const maxClaims = BigInt(questData.maxClaims)
      const expiryTimestamp = BigInt(Math.floor(new Date(questData.expiry).getTime() / 1000))

      // Map quest type to enum value (0=SIMPLE/VERIFICATION, 1=QR, 2=MAP)
      const questTypeEnum = questType === "qr" ? 1 : questType === "map" ? 2 : 0

      console.log("Creating quest on-chain...", {
        name: questData.name,
        description: questData.description,
        questType: questTypeEnum,
        rewardToken: rewardTokenAddress,
        rewardPerClaim: rewardPerClaim.toString(),
        maxClaims: maxClaims.toString(),
        expiryTimestamp: expiryTimestamp.toString()
      })

      toast.info("Creating quest contract...")
      const tx = await factory.createTokenQuest(
        questData.name,
        questData.description,
        questTypeEnum,
        rewardTokenAddress,
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

      // Step 3: Auto-fund if custom token
      if (tokenType === "custom") {
        try {
          toast.info("Auto-funding your quest with custom tokens...")
          const tokenContract = new ethers.Contract(rewardTokenAddress, TokenFactoryABI, signer) // We can reuse the ABI as it has ERC20 methods
          const questContract = new ethers.Contract(questAddress, QuestABI, signer)

          const totalRewardAmount = rewardPerClaim * maxClaims

          toast.info("Approving tokens...")
          const approveTx = await tokenContract.approve(questAddress, totalRewardAmount)
          await approveTx.wait()

          toast.info("Depositing tokens into quest...")
          const fundTx = await questContract.fundWithTokens(totalRewardAmount)
          await fundTx.wait()

          toast.success("Quest auto-funded successfully!")
        } catch (fundErr) {
          console.error("Auto-fund error:", fundErr)
          toast.warning("Quest created but auto-funding failed. You can fund it manually from the dashboard.")
        }
      }

      // Save to Supabase
      const { error: sbError } = await supabase.from("quests").insert({
        address: questAddress,
        name: questData.name,
        description: questData.description,
        quest_type: questType,
        reward_token: rewardTokenAddress,
        reward_per_claim: rewardPerClaim.toString(),
        max_claims: Number(maxClaims),
        expiry_timestamp: Number(expiryTimestamp),
        is_active: true,
        creator_wallet: wallet.address.toLowerCase(),
        image_url: questImageUrl || null,
        is_boosted: questData.isBoosted,
        nft_gate_address: questData.nftGateAddress || null,
        proof_type: questData.proofType,
        is_verified_merchant: true, // Auto-verify quests from creators for now as per V2 roadmap
        metadata: {
          token_type: tokenType,
          custom_token_name: tokenType === "custom" ? customToken.name : null,
          custom_token_symbol: tokenType === "custom" ? customToken.symbol : null,
          boosted_at: questData.isBoosted ? new Date().toISOString() : null
        }
      })

      if (sbError) {
        console.error("Supabase Error:", sbError)
        toast.warning("Quest created on-chain but failed to save to database. Address: " + questAddress)
      } else {
        const tokenLabel = tokenType === "custom" ? customToken.symbol : "KYRA"
        toast.success(`Quest launched successfully! Now fund it with ${tokenLabel} tokens.`)
      }

      router.push("/launch/dashboard")
    } catch (err: any) {
      console.error("Deployment error:", err)
      toast.error(err.reason || err.message || "Failed to launch quest")
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
      id: "social" as const,
      title: "Social Quest",
      description: "Viral campaigns driven by social media actions",
      icon: Zap,
      gradient: "from-blue-400 to-blue-600",
      features: ["X/Twitter following", "Post engagement", "Community growth"]
    },
    {
      id: "verification" as const,
      title: "Identity Quest",
      description: "Identity-based verification for community rewards",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-cyan-500",
      features: ["Verified human", "SBT compatible", "Sybil resistant"]
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

                        <div className="space-y-3">
                          <Label className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-violet-500" />
                            Quest Banner Image
                          </Label>
                          <div className="relative group">
                            <div className={`
                              relative h-40 w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 overflow-hidden
                              ${questImageUrl ? 'border-violet-500 bg-violet-500/5' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'}
                            `}>
                              {questImageUrl ? (
                                <>
                                  <img src={questImageUrl} alt="Quest preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                                  <div className="relative z-10 text-center">
                                    <CheckCircle2 className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                                    <p className="text-violet-400 font-bold text-sm">Image Uploaded!</p>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setQuestImageUrl("")}
                                      className="mt-2 text-xs text-white/40 hover:text-white"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center">
                                  {uploadingImage ? (
                                    <div className="space-y-2">
                                      <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
                                      <p className="text-gray-500 text-sm">Uploading to IPFS...</p>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6 text-violet-500" />
                                      </div>
                                      <p className="text-sm font-medium text-white mb-1">Click to upload image</p>
                                      <p className="text-xs text-gray-500">PNG, JPG or WebP (Max 5MB)</p>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                          const file = e.target.files?.[0]
                                          if (file) {
                                            try {
                                              setUploadingImage(true)
                                              const url = await uploadToPinata(file)
                                              setQuestImageUrl(url)
                                              toast.success("Image uploaded to IPFS!")
                                            } catch (err) {
                                              toast.error("Failed to upload image")
                                            } finally {
                                              setUploadingImage(false)
                                            }
                                          }
                                        }}
                                      />
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
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
                                className="bg-white/5 border-white/10 rounded-xl h-14 pl-5 pr-12 text-white focus:border-violet-500 focus:ring-violet-500/20 transition-all"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-violet-400">
                                {tokenType === 'custom' ? customToken.symbol || 'TOK' : 'KYRA'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gating & Advanced */}
                      <div className="pt-6 border-t border-white/5 space-y-6">
                        <div className="space-y-4">
                          <Label className="text-white text-xs font-black uppercase tracking-widest text-violet-400">Advanced Features</Label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="nftGate" className="text-white text-sm font-bold flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-400" />
                                NFT Gating (Address)
                              </Label>
                              <Input
                                id="nftGate"
                                placeholder="0x... (Optional)"
                                value={questData.nftGateAddress}
                                onChange={(e) => setQuestData({ ...questData, nftGateAddress: e.target.value })}
                                className="bg-white/5 border-white/10 rounded-xl h-14 px-5 text-white focus:border-blue-500 transition-all font-mono text-xs"
                              />
                            </div>

                            <div className="space-y-3">
                              <Label className="text-white text-sm font-bold flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400" />
                                Boosting Status
                              </Label>
                              <div
                                onClick={() => setQuestData({ ...questData, isBoosted: !questData.isBoosted })}
                                className={`h-14 rounded-xl border-2 flex items-center justify-between px-5 cursor-pointer transition-all ${questData.isBoosted ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                              >
                                <span className="text-sm font-bold text-white">Boost Visibility</span>
                                {questData.isBoosted ? <Badge className="bg-yellow-500 text-black font-black">ACTIVE</Badge> : <PlusCircle className="w-5 h-5 text-gray-500" />}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-white text-sm font-bold flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-green-400" />
                              Proof-of-Action Required
                            </Label>
                            <div className="grid grid-cols-3 gap-3">
                              {['none', 'ai_photo', 'social_post'].map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setQuestData({ ...questData, proofType: p as any })}
                                  className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${questData.proofType === p ? 'bg-green-500 border-green-400 text-black' : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'}`}
                                >
                                  {p.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Token Selection */}
                      <div className="space-y-4 pt-4">
                        <Label className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                          <PlusCircle className="w-4 h-4 text-violet-500" />
                          Reward Token
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setTokenType("kyra")}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${tokenType === "kyra"
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                              }`}
                          >
                            <div className="font-bold text-white">KYRA Token</div>
                            <div className="text-sm text-gray-400">Use platform token</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTokenType("custom")}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${tokenType === "custom"
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-white/10 bg-white/5 hover:border-white/20"
                              }`}
                          >
                            <div className="font-bold text-white">Custom Token</div>
                            <div className="text-sm text-gray-400">Launch your own token</div>
                          </button>
                        </div>

                        {/* Custom Token Form */}
                        {tokenType === "custom" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10"
                          >
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-gray-300 text-sm">Token Name</Label>
                                <Input
                                  value={customToken.name}
                                  onChange={(e) => setCustomToken({ ...customToken, name: e.target.value })}
                                  placeholder="e.g. My Quest Token"
                                  className="bg-white/5 border-white/10 text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-gray-300 text-sm">Symbol</Label>
                                <Input
                                  value={customToken.symbol}
                                  onChange={(e) => setCustomToken({ ...customToken, symbol: e.target.value.toUpperCase() })}
                                  placeholder="e.g. MQT"
                                  maxLength={10}
                                  className="bg-white/5 border-white/10 text-white uppercase"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-300 text-sm">Total Supply</Label>
                              <Input
                                type="number"
                                value={customToken.totalSupply}
                                onChange={(e) => setCustomToken({ ...customToken, totalSupply: e.target.value })}
                                placeholder="1000000"
                                className="bg-white/5 border-white/10 text-white"
                              />
                              <p className="text-xs text-gray-500">All tokens will be minted to your wallet</p>
                            </div>
                          </motion.div>
                        )}
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
                          <span className="text-violet-500 font-bold">
                            {tokenType === "custom" ? (customToken.symbol || "TOKEN") : "KYRA"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {tokenType === "custom"
                            ? "Your token will be created when you launch the quest"
                            : "Fund the quest vault after launching"
                          }
                        </p>
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
                          <div className="text-violet-500 font-bold">
                            {tokenType === "custom" ? (customToken.symbol || "TOKEN") : "KYRA"} per claim
                          </div>
                          {tokenType === "custom" && (
                            <div className="text-xs text-gray-400 mt-1">+ New token creation</div>
                          )}
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
