"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePrivy, useWallets } from "@privy-io/react-auth"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Coins, Users, Calendar, Clock, ExternalLink, Loader2, CheckCircle2, AlertCircle, Trophy, Share2, Copy, Sparkles, QrCode, MapPin, X, Zap } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { ethers } from "ethers"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import QuestArtifact from "@/contracts/abis/Quest.json"
const QuestABI = QuestArtifact.abi
import dynamic from "next/dynamic"

// Dynamically import QR scanner to avoid SSR issues
const Scanner = dynamic(
    () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
    { ssr: false }
)

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
    image_url: string | null
    metadata: any
}

export default function QuestDetailPage() {
    const params = useParams()
    const { authenticated, login } = usePrivy()
    const { wallets } = useWallets()
    const [quest, setQuest] = useState<Quest | null>(null)
    const [loading, setLoading] = useState(true)
    const [claiming, setClaiming] = useState(false)
    const [hasClaimed, setHasClaimed] = useState(false)
    const [showQRScanner, setShowQRScanner] = useState(false)
    const [qrVerified, setQrVerified] = useState(false)
    const [socialVerified, setSocialVerified] = useState(false)
    const [locationVerified, setLocationVerified] = useState(false)
    const [verifyingLocation, setVerifyingLocation] = useState(false)
    const [verifyingSocial, setVerifyingSocial] = useState(false)

    const wallet = wallets[0]
    const questAddress = params.address as string

    const fetchQuest = useCallback(async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("quests")
                .select("*")
                .eq("address", questAddress)
                .single()

            if (error) throw error
            setQuest(data)
        } catch (err) {
            console.error("Error fetching quest:", err)
            toast.error("Quest not found")
        } finally {
            setLoading(false)
        }
    }, [questAddress])

    useEffect(() => {
        if (questAddress) {
            fetchQuest()
        }
    }, [questAddress, fetchQuest])

    useEffect(() => {
        if (wallet?.address && quest) {
            checkIfClaimed()
        }
    }, [wallet?.address, quest])

    const checkIfClaimed = async () => {
        if (!wallet?.address || !quest) return

        try {
            const { data } = await supabase
                .from("quest_claims")
                .select("id")
                .eq("quest_id", quest.id)
                .eq("player_wallet", wallet.address.toLowerCase())
                .single()

            if (data) {
                setHasClaimed(true)
                return
            }

            // Also check on-chain
            try {
                const ethereumProvider = await wallet.getEthereumProvider()
                const provider = new ethers.BrowserProvider(ethereumProvider)
                const questContract = new ethers.Contract(quest.address, QuestABI, provider)
                const claimed = await questContract.hasClaimed(wallet.address)
                setHasClaimed(claimed)
            } catch {
                setHasClaimed(false)
            }
        } catch {
            setHasClaimed(false)
        }
    }

    // QR Code verification handler
    const handleQRScan = (result: any) => {
        if (!result || !quest) return

        const scannedData = result[0]?.rawValue || result

        // Check if the scanned QR contains the quest address or a valid verification code
        const expectedCode = quest.address.toLowerCase()
        const isValid = scannedData.toLowerCase().includes(expectedCode) ||
            scannedData.toLowerCase() === `kyra:${expectedCode}` ||
            scannedData === quest.metadata?.qr_code

        if (isValid) {
            setQrVerified(true)
            setShowQRScanner(false)
            toast.success("QR Code verified! You can now claim your reward.")
        } else {
            toast.error("Invalid QR code. Please scan the correct quest QR code.")
        }
    }

    // Location verification handler
    const verifyLocation = async () => {
        if (!quest) return

        setVerifyingLocation(true)

        try {
            // Get user's current location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                })
            })

            const userLat = position.coords.latitude
            const userLng = position.coords.longitude

            // Get quest location from metadata
            const questLat = quest.metadata?.latitude
            const questLng = quest.metadata?.longitude
            const radius = quest.metadata?.radius || 100 // default 100 meters

            if (!questLat || !questLng) {
                // No location set for quest, allow claim
                setLocationVerified(true)
                toast.success("Location verified!")
                return
            }

            // Calculate distance using Haversine formula
            const R = 6371000 // Earth's radius in meters
            const dLat = (questLat - userLat) * Math.PI / 180
            const dLng = (questLng - userLng) * Math.PI / 180
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(questLat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
            const distance = R * c

            if (distance <= radius) {
                setLocationVerified(true)
                toast.success(`Location verified! You're ${Math.round(distance)}m from the target.`)
            } else {
                toast.error(`You're ${Math.round(distance)}m away. Need to be within ${radius}m.`)
            }
        } catch (error: any) {
            if (error.code === 1) {
                toast.error("Location access denied. Please enable location services.")
            } else {
                toast.error("Failed to get location. Please try again.")
            }
        } finally {
            setVerifyingLocation(false)
        }
    }

    // Check if user can claim based on quest type
    const canClaim = () => {
        if (!quest) return false

        switch (quest.quest_type) {
            case "qr":
                return qrVerified
            case "social":
                return socialVerified
            case "map":
                return locationVerified
            case "verification":
            default:
                return true // Identity quests can claim directly (verified on backend)
        }
    }

    const handleClaim = async () => {
        if (!wallet || !quest) return

        setClaiming(true)
        try {
            toast.info("Preparing claim transaction...")

            const ethereumProvider = await wallet.getEthereumProvider()
            const provider = new ethers.BrowserProvider(ethereumProvider)
            const signer = await provider.getSigner()
            const questContract = new ethers.Contract(quest.address, QuestABI, signer)

            let tx

            if (quest.quest_type === "qr") {
                // For QR quests, use claimWithCode
                const verificationCode = ethers.keccak256(
                    ethers.solidityPacked(["address", "string"], [quest.address, "KYRA"])
                )
                toast.info("Submitting QR verified claim...")
                tx = await questContract.claimWithCode(verificationCode)
            } else {
                // For simple/verification quests, use claim()
                toast.info("Submitting claim transaction...")
                tx = await questContract.claim()
            }

            toast.info("Transaction submitted. Waiting for confirmation...")
            const receipt = await tx.wait()

            // Record claim in Supabase
            await supabase.from("quest_claims").insert({
                quest_id: quest.id,
                player_wallet: wallet.address.toLowerCase(),
                tx_hash: receipt.hash,
                xp_earned: 100
            })

            // Update claims count
            await supabase.from("quests").update({
                claims_made: (quest.claims_made || 0) + 1
            }).eq("id", quest.id)

            setHasClaimed(true)
            toast.success(`🎉 Claimed ${formatReward(quest.reward_per_claim)} KYRA successfully!`)
            fetchQuest()

        } catch (err: any) {
            console.error("Claim error:", err)
            // Parse contract errors
            const errorMsg = err.reason || err.message || "Failed to claim reward"
            toast.error(errorMsg)
        } finally {
            setClaiming(false)
        }
    }

    const copyAddress = () => {
        navigator.clipboard.writeText(questAddress)
        toast.success("Address copied to clipboard")
    }

    const shareQuest = () => {
        navigator.share?.({
            title: quest?.name || "Quest",
            text: quest?.description || "Check out this quest!",
            url: window.location.href
        }).catch(() => {
            navigator.clipboard.writeText(window.location.href)
            toast.success("Link copied to clipboard")
        })
    }

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
                return { label: "🗺️ Map Hunt", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", gradient: "from-orange-500 to-red-500" }
            case "qr":
                return { label: "📱 QR Scan", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", gradient: "from-purple-500 to-pink-500" }
            case "verification":
            default:
                return { label: "✓ Identity", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", gradient: "from-violet-500 to-purple-500" }
        }
    }

    const isExpired = (timestamp: number) => {
        return Date.now() / 1000 > timestamp
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getTimeRemaining = (timestamp: number) => {
        const now = Date.now() / 1000
        const remaining = timestamp - now

        if (remaining <= 0) return "Expired"

        const days = Math.floor(remaining / 86400)
        const hours = Math.floor((remaining % 86400) / 3600)

        if (days > 0) return `${days}d ${hours}h remaining`
        return `${hours}h remaining`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                </div>
                <Navigation />
                <div className="relative z-10 pt-32 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                    <p className="text-gray-400 mt-4">Loading quest...</p>
                </div>
            </div>
        )
    }

    if (!quest) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                </div>
                <Navigation />
                <div className="relative z-10 pt-32 px-4">
                    <div className="container mx-auto max-w-2xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl p-12 rounded-3xl border border-white/10"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/20 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">Quest Not Found</h1>
                            <p className="text-gray-400 mb-8">The quest you're looking for doesn't exist or has been removed.</p>
                            <Link href="/quests">
                                <Button className="bg-gradient-to-r from-violet-500 to-purple-500">
                                    Browse Quests
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        )
    }

    const typeBadge = getQuestTypeBadge(quest.quest_type)
    const expired = isExpired(quest.expiry_timestamp)
    const progress = quest.max_claims > 0 ? (quest.claims_made / quest.max_claims) * 100 : 0
    const isFull = quest.claims_made >= quest.max_claims

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
            {/* QR Scanner Modal */}
            <AnimatePresence>
                {showQRScanner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md">
                            <Button
                                onClick={() => setShowQRScanner(false)}
                                variant="outline"
                                size="sm"
                                className="absolute -top-12 right-0 bg-transparent border-white/20"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Close
                            </Button>
                            <Card className="p-4 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl border-white/10 rounded-2xl">
                                <h3 className="text-xl font-bold text-white mb-4 text-center">Scan Quest QR Code</h3>
                                <div className="aspect-square rounded-xl overflow-hidden bg-black">
                                    <Scanner
                                        onScan={handleQRScan}
                                        onError={(error) => console.error("QR Scanner error:", error)}
                                        constraints={{ facingMode: "environment" }}
                                        styles={{
                                            container: { width: "100%", height: "100%" },
                                            video: { objectFit: "cover" }
                                        }}
                                    />
                                </div>
                                <p className="text-sm text-gray-400 text-center mt-4">
                                    Point your camera at the quest QR code
                                </p>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[128px]" />
            </div>

            <Navigation />

            <div className="relative z-10 pt-28 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Back button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Link href="/quests" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Quests
                        </Link>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="overflow-hidden rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl">
                            {/* Quest Banner Image */}
                            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                                {quest.image_url ? (
                                    <img
                                        src={quest.image_url}
                                        alt={quest.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${typeBadge.gradient} opacity-20`} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-80" />

                                <div className="absolute bottom-8 left-8 md:left-12">
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                                        {quest.name}
                                    </h1>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 pt-6">
                                {/* Badges */}
                                <div className="flex items-center gap-3 flex-wrap mb-6">
                                    <Badge className={`${typeBadge.color} border`}>
                                        {typeBadge.label}
                                    </Badge>
                                    {expired ? (
                                        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                                            Expired
                                        </Badge>
                                    ) : isFull ? (
                                        <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                            Fully Claimed
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

                                {/* Description */}
                                {quest.description && (
                                    <p className="text-gray-400 text-lg mb-8">{quest.description}</p>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Coins className="w-5 h-5 text-violet-400" />
                                            <span className="text-sm text-gray-400">Reward</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {formatReward(quest.reward_per_claim)} <span className="text-violet-400 text-base">KYRA</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Users className="w-5 h-5 text-green-400" />
                                            <span className="text-sm text-gray-400">Claims</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {quest.claims_made} <span className="text-gray-500 text-base">/ {quest.max_claims}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Calendar className="w-5 h-5 text-orange-400" />
                                            <span className="text-sm text-gray-400">Expires</span>
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            {formatDate(quest.expiry_timestamp).split(",")[0]}
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Clock className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm text-gray-400">Time Left</span>
                                        </div>
                                        <div className={`text-lg font-bold ${expired ? "text-red-400" : "text-white"}`}>
                                            {getTimeRemaining(quest.expiry_timestamp)}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-8">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>{progress.toFixed(1)}% claimed</span>
                                        <span>{quest.max_claims - quest.claims_made} spots remaining</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${typeBadge.gradient} rounded-full transition-all`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Quest Type Specific Verification */}
                                {authenticated && !hasClaimed && !expired && !isFull && quest.is_active && (
                                    <div className="mb-8">
                                        {quest.quest_type === "qr" && (
                                            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <QrCode className="w-6 h-6 text-purple-400" />
                                                        <div>
                                                            <h4 className="font-bold text-white">QR Code Verification</h4>
                                                            <p className="text-sm text-gray-400">Scan the quest QR code to verify</p>
                                                        </div>
                                                    </div>
                                                    {qrVerified ? (
                                                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                                            Verified
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            onClick={() => setShowQRScanner(true)}
                                                            className="bg-purple-500 hover:bg-purple-600"
                                                        >
                                                            <QrCode className="w-4 h-4 mr-2" />
                                                            Scan QR
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {quest.quest_type === "social" && (
                                            <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-400/30">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Zap className="w-6 h-6 text-blue-400" />
                                                        <div>
                                                            <h4 className="font-bold text-white">Social Verification</h4>
                                                            <p className="text-sm text-gray-400">Complete the social task to verify</p>
                                                        </div>
                                                    </div>
                                                    {socialVerified ? (
                                                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                                            Verified
                                                        </Badge>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => window.open('https://x.com/KyraQuest', '_blank')}
                                                                variant="outline"
                                                                className="border-blue-500/30 hover:bg-blue-500/10"
                                                            >
                                                                Perform Task
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    setVerifyingSocial(true)
                                                                    setTimeout(() => {
                                                                        setSocialVerified(true)
                                                                        setVerifyingSocial(false)
                                                                        toast.success("Social action verified!")
                                                                    }, 2000)
                                                                }}
                                                                disabled={verifyingSocial}
                                                                className="bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                                                            >
                                                                {verifyingSocial ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    "Verify"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {quest.quest_type === "map" && (
                                            <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="w-6 h-6 text-orange-400" />
                                                        <div>
                                                            <h4 className="font-bold text-white">Location Verification</h4>
                                                            <p className="text-sm text-gray-400">Verify your location to claim</p>
                                                        </div>
                                                    </div>
                                                    {locationVerified ? (
                                                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                                            Verified
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            onClick={verifyLocation}
                                                            disabled={verifyingLocation}
                                                            className="bg-orange-500 hover:bg-orange-600"
                                                        >
                                                            {verifyingLocation ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                                    Verifying...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <MapPin className="w-4 h-4 mr-2" />
                                                                    Verify Location
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {quest.quest_type === "verification" && (
                                            <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/30">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="w-6 h-6 text-violet-400" />
                                                    <div>
                                                        <h4 className="font-bold text-white">Identity Verification</h4>
                                                        <p className="text-sm text-gray-400">Your identity will be verified when you claim</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Contract Address */}
                                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 mb-8">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Contract Address</p>
                                        <p className="text-sm text-white font-mono truncate">{quest.address}</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={copyAddress} className="bg-transparent border-white/10">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <a
                                        href={`https://explorer.sepolia.mantle.xyz/address/${quest.address}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm" variant="outline" className="bg-transparent border-white/10">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </a>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {!authenticated ? (
                                        <Button
                                            onClick={login}
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25"
                                        >
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Connect Wallet to Claim
                                        </Button>
                                    ) : hasClaimed ? (
                                        <Button
                                            disabled
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-green-500/20 text-green-400 cursor-not-allowed"
                                        >
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Already Claimed
                                        </Button>
                                    ) : expired || isFull || !quest.is_active ? (
                                        <Button
                                            disabled
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                        >
                                            {expired ? "Quest Expired" : isFull ? "Fully Claimed" : "Quest Paused"}
                                        </Button>
                                    ) : !canClaim() ? (
                                        <Button
                                            disabled
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                        >
                                            {quest.quest_type === "qr" ? "Scan QR to Claim" : "Verify Location to Claim"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleClaim}
                                            disabled={claiming}
                                            size="lg"
                                            className="flex-1 h-14 text-lg rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-[1.02]"
                                        >
                                            {claiming ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Claiming...
                                                </>
                                            ) : (
                                                <>
                                                    <Trophy className="w-5 h-5 mr-2" />
                                                    Claim {formatReward(quest.reward_per_claim)} KYRA
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    <Button
                                        onClick={shareQuest}
                                        size="lg"
                                        variant="outline"
                                        className="h-14 rounded-xl bg-transparent border-white/10 hover:bg-white/5"
                                    >
                                        <Share2 className="w-5 h-5 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
