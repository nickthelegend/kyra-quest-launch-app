"use client"

import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { Menu, X, AlertTriangle, Trophy } from "lucide-react"
import { useState, useEffect } from "react"
import { useNetwork } from "@/hooks/use-network"
import { supabase } from "@/lib/supabase"

export function Navigation() {
  const { login, logout, authenticated, user } = usePrivy()
  const { isMantleSepolia, switchToMantleSepolia, isSwitching, currentChainName } = useNetwork()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [questCount, setQuestCount] = useState<number>(0)

  useEffect(() => {
    fetchQuestCount()
  }, [])

  const fetchQuestCount = async () => {
    try {
      const { count } = await supabase
        .from("quests")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)

      setQuestCount(count || 0)
    } catch (err) {
      console.error("Error fetching quest count:", err)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/launch" className="flex items-center gap-2">
            <img src="/icon-logo-text.png" alt="KyraQuest" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/map" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Map
            </Link>
            <Link href="/feed" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Feed
            </Link>
            <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Shop
            </Link>
            <Link href="/quests" className="relative flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
              <Trophy className="w-4 h-4" />
              Quests
              {questCount > 0 && (
                <span className="absolute -top-2 -right-4 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] font-bold">
                  {questCount > 99 ? "99+" : questCount}
                </span>
              )}
            </Link>

            {authenticated && (
              <Link href="/launch/dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Dashboard
              </Link>
            )}

            {/* More Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                More
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-[#12121a] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60]">
                <Link href="/tokens" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  Tokens
                </Link>
                <Link href="/leaderboard" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  Leaderboard
                </Link>
                <Link href="/download" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  Download
                </Link>
                {authenticated && (
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    Profile
                  </Link>
                )}
                <Link href="/help" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                  Help
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {authenticated ? (
              <>
                <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Network
                  </span>
                  <span className={`text-xs font-medium ${isMantleSepolia ? "text-primary" : "text-destructive"}`}>
                    {currentChainName}
                  </span>
                </div>
                {!isMantleSepolia && (
                  <Button
                    onClick={switchToMantleSepolia}
                    disabled={isSwitching}
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {isSwitching ? "Switching..." : "Switch to Mantle"}
                  </Button>
                )}
                <Button onClick={logout} variant="outline" size="sm" className="rounded-full px-4 border-white/10 hover:bg-white/5">
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={login} className="rounded-full px-6 bg-gradient-to-r from-violet-500 to-purple-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all font-bold">
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href="/launch" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                Map
              </Link>
              <Link href="/feed" className="text-muted-foreground hover:text-foreground transition-colors">
                Feed
              </Link>
              <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
              <Link href="/quests" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Trophy className="w-4 h-4" />
                Quests
                {questCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] font-bold">
                    {questCount > 99 ? "99+" : questCount}
                  </span>
                )}
              </Link>
              <Link href="/tokens" className="text-muted-foreground hover:text-foreground transition-colors">
                Tokens
              </Link>
              <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Leaderboard
              </Link>
              <Link href="/download" className="text-muted-foreground hover:text-foreground transition-colors">
                Download
              </Link>
              <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                Help
              </Link>
              {authenticated && (
                <>
                  <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                    Profile
                  </Link>
                  <Link
                    href="/launch/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              )}
              {authenticated && !isMantleSepolia && (
                <Button
                  onClick={switchToMantleSepolia}
                  disabled={isSwitching}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {isSwitching ? "Switching..." : "Switch to Mantle"}
                </Button>
              )}
              {authenticated ? (
                <Button onClick={logout} variant="outline" className="w-full bg-transparent">
                  Logout
                </Button>
              ) : (
                <Button onClick={login} className="w-full bg-primary hover:bg-secondary">
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
