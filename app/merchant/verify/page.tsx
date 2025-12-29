"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePrivy } from "@privy-io/react-auth"
import { useState } from "react"
import { Shield, CheckCircle2, Upload } from "lucide-react"

export default function MerchantVerifyPage() {
  const { authenticated, login } = usePrivy()
  const [verificationData, setVerificationData] = useState({
    businessName: "",
    businessAddress: "",
    taxId: "",
    phone: "",
    website: "",
  })
  const [submitted, setSubmitted] = useState(false)

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-8">{"Please log in to verify your merchant status"}</p>
            <Button onClick={login} className="bg-primary hover:bg-secondary">
              Login with Privy
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Merchant verification submitted:", verificationData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card className="p-12 bg-card border-border text-center glow-primary">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">Verification Submitted!</h1>
              <p className="text-muted-foreground mb-8">
                {
                  "Thank you for submitting your merchant verification. Our team will review your application within 24-48 hours and send you a confirmation email."
                }
              </p>
              <Button
                className="bg-primary hover:bg-secondary"
                onClick={() => (window.location.href = "/launch/dashboard")}
              >
                Go to Dashboard
              </Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">Merchant Verification</h1>
            </div>
            <p className="text-muted-foreground">
              {"Verify your business to unlock premium merchant features and build trust with your customers."}
            </p>
          </div>

          <Card className="p-8 bg-card border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="businessName" className="text-foreground">
                  Business Name *
                </Label>
                <Input
                  id="businessName"
                  required
                  value={verificationData.businessName}
                  onChange={(e) => setVerificationData({ ...verificationData, businessName: e.target.value })}
                  placeholder="Enter your business name"
                  className="mt-1 bg-background border-border"
                />
              </div>

              <div>
                <Label htmlFor="businessAddress" className="text-foreground">
                  Business Address *
                </Label>
                <Input
                  id="businessAddress"
                  required
                  value={verificationData.businessAddress}
                  onChange={(e) => setVerificationData({ ...verificationData, businessAddress: e.target.value })}
                  placeholder="Street address, City, State, ZIP"
                  className="mt-1 bg-background border-border"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxId" className="text-foreground">
                    Tax ID / EIN *
                  </Label>
                  <Input
                    id="taxId"
                    required
                    value={verificationData.taxId}
                    onChange={(e) => setVerificationData({ ...verificationData, taxId: e.target.value })}
                    placeholder="XX-XXXXXXX"
                    className="mt-1 bg-background border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-foreground">
                    Business Phone *
                  </Label>
                  <Input
                    id="phone"
                    required
                    type="tel"
                    value={verificationData.phone}
                    onChange={(e) => setVerificationData({ ...verificationData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1 bg-background border-border"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-foreground">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={verificationData.website}
                  onChange={(e) => setVerificationData({ ...verificationData, website: e.target.value })}
                  placeholder="https://yourbusiness.com"
                  className="mt-1 bg-background border-border"
                />
              </div>

              <div>
                <Label className="text-foreground">Business Documents</Label>
                <div className="mt-2 p-8 rounded-lg border-2 border-dashed border-border bg-muted/20 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Upload business license or registration documents
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, PNG, or JPG (max 10MB)</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <Button type="submit" className="w-full bg-primary hover:bg-secondary glow-hover" size="lg">
                  Submit for Verification
                </Button>
              </div>
            </form>
          </Card>

          <Card className="mt-6 p-6 bg-primary/5 border-primary/20">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Why Verify?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Verified badge on your merchant profile</li>
              <li>• Access to advanced campaign analytics</li>
              <li>• Priority support from our team</li>
              <li>• Higher visibility in the merchant directory</li>
              <li>• Ability to issue branded NFT rewards</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
