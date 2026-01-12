"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import { useState, useEffect } from "react"
import { Map, QrCode, CheckCircle2, ArrowLeft, ArrowRight, Loader2, Rocket, Coins, Calendar, Users } from "lucide-react"
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
  const { authenticated, login, user } = usePrivy()
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
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 z-0" />
        <Navigation />
        <div className="relative z-10 pt-32 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-12 rounded-3xl border border-white/10"
            >
              <h1 className="text-4xl font-bold text-foreground mb-4">Launch Your Quest</h1>
              <p className="text-muted-foreground mb-8 text-lg">Connect your wallet to start creating rewarding experiences for your community.</p>
              <Button onClick={login} size="lg" className="bg-primary hover:bg-secondary text-lg px-8 py-6 h-auto glow-primary">
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
      const provider = await wallet.getEthersProvider()
      const signer = await provider.getSigner()

      const factory = new ethers.Contract(QUEST_FACTORY_ADDRESS, QuestFactoryABI, signer)

      // Convert inputs
      const rewardPerClaim = ethers.parseUnits(questData.rewardAmount, 18) // Assuming 18 decimals
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

      // Find the QuestCreated event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return factory.interface.parseLog(log)
          } catch (e) {
            return null
          }
        })
        .find((e: any) => e && e.name === "QuestCreated")

      if (!event) throw new Error("QuestCreated event not found")

      const questAddress = event.args.questAddress
      console.log("New Quest Address:", questAddress)

      // Store in Supabase
      const { error: sbError } = await supabase.from("quests").insert({
        address: questAddress,
        name: questData.name,
        description: questData.description,
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 z-0" />
      <Navigation />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-5xl font-extrabold text-foreground mb-3 tracking-tight">Create a Quest</h1>
            <div className="flex items-center justify-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= s ? "bg-primary text-black glow-primary" : "bg-muted text-muted-foreground border border-border"}`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-12 h-0.5 mx-2 transition-all duration-500 ${step > s ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
          </motion.div>

          <Card className="p-1 gap-0 overflow-hidden rounded-[2rem] border-border bg-card/50 backdrop-blur-xl shadow-2xl relative">
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
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-foreground">What's the challenge?</h2>
                      <p className="text-muted-foreground text-lg">Choose a quest type that fits your campaign goals.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <button
                        onClick={() => setQuestType("map")}
                        className={`group p-8 rounded-3xl border-2 transition-all text-left flex flex-col items-center text-center ${questType === "map"
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-border hover:border-primary/40 hover:bg-primary/5"
                          }`}
                      >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all ${questType === "map" ? "bg-primary text-black glow-primary" : "bg-muted text-muted-foreground group-hover:text-primary"}`}>
                          <Map className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Map Hunt</h3>
                        <p className="text-sm text-muted-foreground">Geo-fenced treasure hunt with real-world goals.</p>
                      </button>

                      <button
                        onClick={() => setQuestType("qr")}
                        className={`group p-8 rounded-3xl border-2 transition-all text-left flex flex-col items-center text-center ${questType === "qr"
                            ? "border-secondary bg-secondary/10 scale-105"
                            : "border-border hover:border-secondary/40 hover:bg-secondary/5"
                          }`}
                      >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all ${questType === "qr" ? "bg-secondary text-black" : "bg-muted text-muted-foreground group-hover:text-secondary"}`}>
                          <QrCode className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">QR Scan</h3>
                        <p className="text-sm text-muted-foreground">In-person redemption via unique QR codes.</p>
                      </button>

                      <button
                        onClick={() => setQuestType("verification")}
                        className={`group p-8 rounded-3xl border-2 transition-all text-left flex flex-col items-center text-center ${questType === "verification"
                            ? "border-primary bg-primary/10 scale-105"
                            : "border-border hover:border-primary/40 hover:bg-primary/5"
                          }`}
                      >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all ${questType === "verification" ? "bg-primary text-black glow-primary" : "bg-muted text-muted-foreground group-hover:text-primary"}`}>
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Identity</h3>
                        <p className="text-sm text-muted-foreground">Social and identity-based verification rewards.</p>
                      </button>
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
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-foreground">Quest Details</h2>
                      <p className="text-muted-foreground text-lg">Define the rules and rewards for your quest.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-foreground text-sm font-bold uppercase tracking-wider ml-1">
                            Quest Name
                          </Label>
                          <Input
                            id="name"
                            value={questData.name}
                            onChange={(e) => setQuestData({ ...questData, name: e.target.value })}
                            placeholder="e.g. Mantle Explorer Hunt"
                            className="bg-background/50 border-border rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-foreground text-sm font-bold uppercase tracking-wider ml-1">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={questData.description}
                            onChange={(e) => setQuestData({ ...questData, description: e.target.value })}
                            placeholder="What do players need to do?"
                            className="bg-background/50 border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all"
                            rows={5}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="expiry" className="text-foreground text-sm font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" /> Expiry Date
                          </Label>
                          <Input
                            id="expiry"
                            type="date"
                            value={questData.expiry}
                            onChange={(e) => setQuestData({ ...questData, expiry: e.target.value })}
                            className="bg-background/50 border-border rounded-xl h-12 px-4"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="maxClaims" className="text-foreground text-sm font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" /> Max Claims
                            </Label>
                            <Input
                              id="maxClaims"
                              type="number"
                              value={questData.maxClaims}
                              onChange={(e) => setQuestData({ ...questData, maxClaims: e.target.value })}
                              className="bg-background/50 border-border rounded-xl h-12 px-4"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="reward" className="text-foreground text-sm font-bold uppercase tracking-wider ml-1 flex items-center gap-2">
                              <Coins className="w-4 h-4 text-primary" /> Reward (KYRA)
                            </Label>
                            <Input
                              id="reward"
                              type="number"
                              value={questData.rewardAmount}
                              onChange={(e) => setQuestData({ ...questData, rewardAmount: e.target.value })}
                              className="bg-background/50 border-border rounded-xl h-12 px-4"
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4 leading-relaxed">
                          <p className="text-sm text-muted-foreground">
                            <span className="text-primary font-bold">Total Budget: </span>
                            {(Number(questData.maxClaims) * Number(questData.rewardAmount)).toLocaleString()} KYRA
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">You will need to fund the quest vault after launching.</p>
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
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-bold text-foreground">Ready to Launch?</h2>
                      <p className="text-muted-foreground text-lg">Review your quest configuration before deploying to Mantle.</p>
                    </div>

                    <div className="bg-background/30 rounded-3xl border border-border p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{questData.name}</h3>
                          <p className="text-primary flex items-center gap-2 mt-1">
                            {questType === "map" ? <Map className="w-4 h-4" /> : questType === "qr" ? <QrCode className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            {questType?.toUpperCase()} QUEST
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-extrabold text-foreground">{questData.rewardAmount} <span className="text-sm font-normal text-muted-foreground tracking-widest uppercase">KYRA</span></p>
                          <p className="text-sm text-muted-foreground">Per Claim</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/50">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Max Claims</p>
                          <p className="text-xl font-bold">{questData.maxClaims}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Ends On</p>
                          <p className="text-xl font-bold">{questData.expiry || "No date"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Reward</p>
                          <p className="text-xl font-bold text-primary">{(Number(questData.maxClaims) * Number(questData.rewardAmount)).toLocaleString()}</p>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed italic">"{questData.description || "No description provided."}"</p>
                    </div>

                    {loading && (
                      <div className="flex flex-col items-center gap-3 pt-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-primary font-medium animate-pulse">Deploying to Mantle Network...</p>
                        {txHash && (
                          <a
                            href={`https://explorer.sepolia.mantle.xyz/tx/${txHash}`}
                            target="_blank"
                            className="text-xs text-muted-foreground underline"
                          >
                            View Transaction
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-border/50">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={step === 1 || loading}
                  className="gap-2 rounded-2xl px-6 h-12 bg-transparent hover:bg-white/5 border-border transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>

                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={step === 1 && !questType}
                    className="gap-2 rounded-2xl px-8 h-12 bg-primary hover:bg-secondary text-black font-bold transition-all glow-primary"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="gap-2 rounded-2xl px-10 h-14 bg-primary hover:bg-secondary text-black font-extrabold text-lg transition-all glow-primary"
                  >
                    {!loading ? (
                      <>
                        <Rocket className="w-5 h-5 fill-current" />
                        Launch Quest
                      </>
                    ) : (
                      "Processing..."
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
