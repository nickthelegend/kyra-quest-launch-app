"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Tag, Star, Clock, ShieldCheck, Ticket, Search, Filter, Coins, Loader2, ArrowRight, Store } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { usePrivy } from "@privy-io/react-auth"

interface Coupon {
    id: string
    merchant_wallet: string
    merchant_name: string
    title: string
    description: string
    price_amount: number
    price_token: string
    image_url: string
    stock_count: number
}

const MOCK_COUPONS: Coupon[] = [
    {
        id: "1",
        merchant_wallet: "0x...",
        merchant_name: "Ethos Coffee",
        title: "Free Morning Latte",
        description: "Redeemable at any Ethos Coffee branch. Valid for all large drinks.",
        price_amount: 50,
        price_token: "KYRA",
        image_url: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=800&q=80",
        stock_count: 85
    },
    {
        id: "2",
        merchant_wallet: "0x...",
        merchant_name: "Tech Hub Cowork",
        title: "1-Day Hot Desk Pass",
        description: "Full day access to our premium coworking spaces and gigabit wifi.",
        price_amount: 15.5,
        price_token: "TECH",
        image_url: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80",
        stock_count: 12
    },
    {
        id: "3",
        merchant_wallet: "0x...",
        merchant_name: "Mantle Fitness",
        title: "Personal Training Session",
        description: "1-hour session with a certified Mantle Fitness coach.",
        price_amount: 500,
        price_token: "KYRA",
        image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
        stock_count: 5
    }
]

export default function ShopPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const { authenticated, login, user } = usePrivy()

    useEffect(() => {
        const fetchCoupons = async () => {
            const { data, error } = await supabase
                .from("merchant_coupons")
                .select("*")
                .eq("is_active", true)

            if (data && data.length > 0) {
                setCoupons(data)
            } else {
                setCoupons(MOCK_COUPONS)
            }
            setLoading(false)
        }
        fetchCoupons()
    }, [])

    const handlePurchase = async (coupon: Coupon) => {
        if (!authenticated) {
            login()
            return
        }

        try {
            setLoading(true)
            // 1. In a real app, we would verify token balance and call a smart contract/API
            // For this demo, we'll simulate the purchase in Supabase

            const redeemCode = Math.random().toString(36).substring(2, 10).toUpperCase()

            const { error: claimError } = await supabase
                .from("merchant_coupon_claims")
                .insert({
                    coupon_id: coupon.id,
                    buyer_wallet: user?.wallet?.address,
                    purchase_price: coupon.price_amount,
                    purchase_token: coupon.price_token,
                    redeem_code: redeemCode
                })

            if (claimError) throw claimError

            // 2. Update stock count
            const { error: stockError } = await supabase
                .from("merchant_coupons")
                .update({ stock_count: coupon.stock_count - 1 })
                .eq("id", coupon.id)

            if (stockError) throw stockError

            toast.success(`Purchased! Your code: ${redeemCode}`, {
                duration: 10000,
                description: "Show this code to the merchant to redeem."
            })

            // Refresh coupons
            setCoupons(coupons.map(c => c.id === coupon.id ? { ...c, stock_count: c.stock_count - 1 } : c))

        } catch (err) {
            toast.error("Purchase failed. Check your token balance.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden font-sans">
            {/* Animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[128px]" />
            </div>

            <Navigation />

            <div className="relative z-10 pt-28 pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
                        <div className="text-center md:text-left space-y-3">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold animate-pulse">
                                <ShoppingBag className="w-4 h-4" />
                                Verified Merchant Coupons
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">
                                Market<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Place</span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-md">
                                Spend your quest rewards on real-world value from our verified partners.
                            </p>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-4">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search coffee, gym, tech..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-4 text-white focus:border-emerald-500 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 h-12 text-sm font-bold gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </Button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Marketplace...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {coupons.map((coupon) => (
                                <motion.div
                                    key={coupon.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ y: -8 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="group overflow-hidden rounded-[32px] border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-2xl h-full flex flex-col">
                                        <div className="relative h-56 overflow-hidden">
                                            <img
                                                src={coupon.image_url}
                                                alt={coupon.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                            <div className="absolute top-4 left-4 flex gap-2">
                                                <Badge className="bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest px-3 py-1.5">
                                                    Verified
                                                </Badge>
                                                {coupon.stock_count < 20 && (
                                                    <Badge className="bg-red-500 text-white font-black uppercase text-[10px] tracking-widest px-3 py-1.5">
                                                        Low Stock
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                                    <Store className="w-4 h-4 text-black" />
                                                </div>
                                                <span className="text-white font-black text-sm uppercase tracking-wide">{coupon.merchant_name}</span>
                                            </div>
                                        </div>

                                        <div className="p-8 flex flex-col flex-1">
                                            <div className="flex-1 mb-6">
                                                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                                    {coupon.title}
                                                </h3>
                                                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                                                    {coupon.description}
                                                </p>
                                            </div>

                                            <div className="pb-6 mb-6 border-b border-white/5 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Price</p>
                                                    <div className="flex items-center gap-2">
                                                        <Coins className="w-5 h-5 text-emerald-400" />
                                                        <span className="text-3xl font-black text-white">{coupon.price_amount}</span>
                                                        <span className="text-emerald-500 font-bold text-sm tracking-tighter">{coupon.price_token}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Available</p>
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Ticket className="w-4 h-4 text-gray-500" />
                                                        <span className="text-white font-bold">{coupon.stock_count}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handlePurchase(coupon)}
                                                disabled={loading || coupon.stock_count === 0}
                                                className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black text-lg transition-all shadow-lg shadow-emerald-500/20 group/btn"
                                            >
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                    <>
                                                        {coupon.stock_count === 0 ? "Out of Stock" : "Purchase Now"}
                                                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
