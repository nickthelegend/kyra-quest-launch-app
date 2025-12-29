"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePrivy } from "@privy-io/react-auth"
import { useState } from "react"
import { Map, QrCode, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

type QuestType = "map" | "qr" | "verification" | null

export default function CreateQuestPage() {
  const router = useRouter()
  const { authenticated, login } = usePrivy()
  const [step, setStep] = useState(1)
  const [questType, setQuestType] = useState<QuestType>(null)
  const [questData, setQuestData] = useState({
    name: "",
    description: "",
    expiry: "",
    maxClaims: "",
    rewardAmount: "",
  })

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-8">{"Please log in to create a quest"}</p>
            <Button onClick={login} className="bg-primary hover:bg-secondary">
              Login with Privy
            </Button>
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

  const handleSubmit = () => {
    console.log("[v0] Quest created:", { questType, ...questData })
    router.push("/launch/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Create a Quest</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>

          <Card className="p-8 bg-card border-border">
            {/* Step 1: Select Quest Type */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Select Quest Type</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setQuestType("map")}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      questType === "map"
                        ? "border-primary bg-primary/10 glow-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Map
                      className={`w-10 h-10 mb-4 ${questType === "map" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <h3 className="text-lg font-bold text-foreground mb-2">Map Hunt</h3>
                    <p className="text-sm text-muted-foreground">Geo-fenced treasure hunt</p>
                  </button>

                  <button
                    onClick={() => setQuestType("qr")}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      questType === "qr"
                        ? "border-secondary bg-secondary/10 glow-primary"
                        : "border-border hover:border-secondary/50"
                    }`}
                  >
                    <QrCode
                      className={`w-10 h-10 mb-4 ${questType === "qr" ? "text-secondary" : "text-muted-foreground"}`}
                    />
                    <h3 className="text-lg font-bold text-foreground mb-2">QR Scan</h3>
                    <p className="text-sm text-muted-foreground">QR code redemption</p>
                  </button>

                  <button
                    onClick={() => setQuestType("verification")}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      questType === "verification"
                        ? "border-primary bg-primary/10 glow-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-10 h-10 mb-4 ${questType === "verification" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <h3 className="text-lg font-bold text-foreground mb-2">Verification</h3>
                    <p className="text-sm text-muted-foreground">Identity-based airdrop</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Configure Quest */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Configure Quest</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Quest Name
                    </Label>
                    <Input
                      id="name"
                      value={questData.name}
                      onChange={(e) => setQuestData({ ...questData, name: e.target.value })}
                      placeholder="Enter quest name"
                      className="mt-1 bg-background border-border"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-foreground">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={questData.description}
                      onChange={(e) => setQuestData({ ...questData, description: e.target.value })}
                      placeholder="Describe your quest"
                      className="mt-1 bg-background border-border"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-foreground">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiry"
                        type="date"
                        value={questData.expiry}
                        onChange={(e) => setQuestData({ ...questData, expiry: e.target.value })}
                        className="mt-1 bg-background border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxClaims" className="text-foreground">
                        Max Claims
                      </Label>
                      <Input
                        id="maxClaims"
                        type="number"
                        value={questData.maxClaims}
                        onChange={(e) => setQuestData({ ...questData, maxClaims: e.target.value })}
                        placeholder="100"
                        className="mt-1 bg-background border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reward" className="text-foreground">
                      Reward per Claim (KYRA)
                    </Label>
                    <Input
                      id="reward"
                      type="number"
                      value={questData.rewardAmount}
                      onChange={(e) => setQuestData({ ...questData, rewardAmount: e.target.value })}
                      placeholder="10"
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location & Rules */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Location & Rules</h2>

                {questType === "map" && (
                  <div>
                    <Label className="text-foreground">Map Area</Label>
                    <div className="mt-2 h-64 rounded-lg bg-muted border border-border flex items-center justify-center">
                      <p className="text-muted-foreground">Map integration coming soon</p>
                    </div>
                  </div>
                )}

                {questType === "qr" && (
                  <div>
                    <Label htmlFor="qr" className="text-foreground">
                      QR Code
                    </Label>
                    <div className="mt-2 p-8 rounded-lg border-2 border-dashed border-border bg-muted/20 text-center">
                      <QrCode className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload or generate QR code</p>
                    </div>
                  </div>
                )}

                {questType === "verification" && (
                  <div>
                    <Label className="text-foreground">Verification Rules</Label>
                    <Card className="mt-2 p-4 bg-background border-border">
                      <p className="text-sm text-muted-foreground">
                        • One claim per verified wallet
                        <br />• Email verification required
                        <br />• No location requirements
                      </p>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button onClick={handleBack} variant="outline" disabled={step === 1} className="gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={step === 1 && !questType}
                  className="gap-2 bg-primary hover:bg-secondary"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-2 bg-primary hover:bg-secondary glow-hover">
                  Launch Quest
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
