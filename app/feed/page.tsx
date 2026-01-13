"use client"

import { Navigation } from "@/components/navigation"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Share2, Music, Trophy, User, PlusCircle, Loader2, Sparkles, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"
import { toast } from "sonner"
import { uploadToPinata } from "@/lib/pinata"
import { Video, X, Send, Sparkles as SparklesIcon, Instagram, Film, Music as MusicIcon, Tag, Rocket } from "lucide-react"
import { Label } from "@/components/ui/label"

interface Post {
    id: string
    video_url: string
    caption: string
    owner_wallet: string
    quest_address: string
    likes: number
}

const MOCK_POSTS: Post[] = [
    {
        id: "1",
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lighting-in-the-city-21841-large.mp4",
        caption: "Just finished the Neon Hunt! 🏮 #KyraQuest #Mantle",
        owner_wallet: "0x1234...5678",
        quest_address: "0xabc...",
        likes: 245
    },
    {
        id: "2",
        video_url: "https://assets.mixkit.co/videos/preview/mixkit-urban-roller-skating-at-night-44565-large.mp4",
        caption: "Geo-questing around SF. Found the hidden vault! 💎",
        owner_wallet: "0x8888...9999",
        quest_address: "0xdef...",
        likes: 890
    }
]

export default function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)
    const { authenticated, login, user } = usePrivy()
    const containerRef = useRef<HTMLDivElement>(null)

    // Upload states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [videoUrl, setVideoUrl] = useState("")
    const [caption, setCaption] = useState("")
    const [selectedQuest, setSelectedQuest] = useState("")
    const [userQuests, setUserQuests] = useState<any[]>([])

    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from("feed_posts")
                .select("*")
                .order("created_at", { ascending: false })

            if (data && data.length > 0) {
                setPosts(data)
            } else {
                setPosts(MOCK_POSTS)
            }
            setLoading(false)
        }
        fetchPosts()
    }, [])

    const fetchuserQuests = async () => {
        if (!user?.wallet?.address) return
        const { data } = await supabase
            .from("quest_claims")
            .select("*, quests(*)")
            .eq("player_wallet", user.wallet.address)

        if (data) {
            setUserQuests(data.map(d => d.quests))
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        try {
            setUploading(true)
            const url = await uploadToPinata(file)
            setVideoUrl(url)
            toast.success("Reel uploaded to IPFS!")
        } catch (err) {
            toast.error("Upload failed")
        } finally {
            setUploading(false)
        }
    }

    const handleSubmitReel = async () => {
        if (!videoUrl || !caption) return
        try {
            setUploading(true)
            const { data, error } = await supabase
                .from("feed_posts")
                .insert({
                    owner_wallet: user?.wallet?.address,
                    video_url: videoUrl,
                    caption,
                    quest_address: selectedQuest,
                    likes: 0
                })
                .select()

            if (error) throw error

            toast.success("Reel posted to feed!")
            if (data) setPosts([data[0], ...posts])
            setIsUploadModalOpen(false)
            setVideoUrl("")
            setCaption("")
        } catch (err) {
            toast.error("Failed to post reel")
        } finally {
            setUploading(false)
        }
    }

    const handleScroll = () => {
        if (!containerRef.current) return
        const index = Math.round(containerRef.current.scrollTop / window.innerHeight)
        if (index !== activeIndex) {
            setActiveIndex(index)
        }
    }

    return (
        <div className="h-screen bg-black overflow-hidden relative font-sans">
            <Navigation />

            {/* Floating Header */}
            <div className="absolute top-24 left-0 right-0 z-50 flex justify-center gap-6 pointer-events-none">
                <button className="text-white/60 font-black text-sm uppercase tracking-widest px-4 py-2 border-b-2 border-transparent pointer-events-auto">Following</button>
                <button className="text-white font-black text-sm uppercase tracking-widest px-4 py-2 border-b-2 border-violet-500 pointer-events-auto">For You</button>
            </div>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
            >
                {loading ? (
                    <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
                        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
                    </div>
                ) : (
                    posts.map((post, idx) => (
                        <div key={post.id} className="h-screen w-full snap-start relative flex items-center justify-center bg-zinc-900">
                            {/* Video Background */}
                            <video
                                src={post.video_url}
                                className="h-full w-full object-cover"
                                autoPlay={idx === activeIndex}
                                loop
                                muted
                                playsInline
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                            {/* Side Actions */}
                            <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-20">
                                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                                    <div className="w-14 h-14 rounded-full border-2 border-violet-500 p-0.5 bg-black/20 backdrop-blur-md flex items-center justify-center overflow-hidden">
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="absolute -bottom-2 bg-violet-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlusCircle className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <button className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center group hover:bg-red-500/20 transition-all">
                                        <Heart className="w-7 h-7 text-white group-hover:text-red-500 transition-colors" />
                                    </button>
                                    <span className="text-white text-xs font-bold">{post.likes}</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <button className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                                        <MessageCircle className="w-7 h-7 text-white" />
                                    </button>
                                    <span className="text-white text-xs font-bold">42</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <button className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                                        <Share2 className="w-7 h-7 text-white" />
                                    </button>
                                </div>

                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border-2 border-white/10 flex items-center justify-center"
                                >
                                    <Music className="w-6 h-6 text-violet-400" />
                                </motion.div>
                            </div>

                            {/* Bottom Content */}
                            <div className="absolute bottom-8 left-4 right-20 z-20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="px-4 py-1.5 rounded-full bg-violet-500/20 backdrop-blur-md border border-violet-500/30 flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-violet-400" />
                                        <span className="text-white text-xs font-black uppercase tracking-wider">Quest Achievement</span>
                                    </div>
                                    {idx === 0 && (
                                        <div className="px-4 py-1.5 rounded-full bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-yellow-400" />
                                            <span className="text-yellow-400 text-xs font-black uppercase tracking-wider">Minted as NFT</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-white font-black text-xl mb-2 flex items-center gap-2">
                                    @{post.owner_wallet.slice(0, 6)}...{post.owner_wallet.slice(-4)}
                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Zap className="w-2.5 h-2.5 text-white" />
                                    </div>
                                </h3>

                                <p className="text-white/90 text-sm mb-4 leading-relaxed line-clamp-2">
                                    {post.caption}
                                </p>

                                <div className="flex items-center gap-2 text-white text-xs font-bold">
                                    <Music className="w-3 h-3" />
                                    <span>Original Sound - Quest Beats Vol. 1</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Create Button */}
            {!loading && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
                    <Button
                        onClick={() => {
                            if (!authenticated) {
                                login()
                            } else {
                                fetchuserQuests()
                                setIsUploadModalOpen(true)
                            }
                        }}
                        className="rounded-full h-14 px-8 bg-white text-black hover:bg-white/90 font-black shadow-2xl flex items-center gap-2 border-4 border-black/20"
                    >
                        <PlusCircle className="w-6 h-6" />
                        Upload Adventure
                    </Button>
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                    >
                        <div className="bg-[#12121a] w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Video className="w-5 h-5 text-violet-500" />
                                    Post a Reel
                                </h3>
                                <button onClick={() => setIsUploadModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-gray-400 text-xs font-bold uppercase tracking-widest">Capture your moment</Label>
                                    <div className="relative h-64 w-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/[0.02] overflow-hidden group">
                                        {videoUrl ? (
                                            <video src={videoUrl} className="h-full w-full object-cover" controls />
                                        ) : (
                                            <>
                                                <Film className="w-12 h-12 text-white/20 mb-3 group-hover:text-violet-500 transition-colors" />
                                                <p className="text-gray-500 text-sm font-medium">Click to select MP4 reel</p>
                                                <p className="text-[10px] text-gray-600 mt-1 uppercase">Max duration: 30s</p>
                                                <input
                                                    type="file"
                                                    accept="video/mp4"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-gray-400 text-xs font-bold uppercase tracking-widest">Quest Link</Label>
                                    <select
                                        value={selectedQuest}
                                        onChange={(e) => setSelectedQuest(e.target.value)}
                                        className="w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white focus:outline-none focus:border-violet-500 transition-all font-bold"
                                    >
                                        <option value="">Link to a Quest (Optional)</option>
                                        {userQuests.map(q => (
                                            <option key={q.address} value={q.address}>{q.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-gray-400 text-xs font-bold uppercase tracking-widest">Caption</Label>
                                    <textarea
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="What's happening in this reel?"
                                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 text-white focus:outline-none focus:border-violet-500 transition-all min-h-[120px] font-medium"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmitReel}
                                    disabled={uploading || !videoUrl || !caption}
                                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-black text-lg shadow-xl shadow-violet-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                    Share to Feed
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}
