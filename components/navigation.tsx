"use client"

import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { MapPin, Menu, X, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { useNetwork } from "@/hooks/use-network"

export function Navigation() {
  const { login, logout, authenticated, user } = usePrivy()
  const { isMantleSepolia, switchToMantleSepolia, isSwitching, currentChainName } = useNetwork()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/launch" className="flex items-center gap-2">
            <img src="/icon-logo-text.png" alt="KyraQuest" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/launch" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/launch/merchant" className="text-muted-foreground hover:text-foreground transition-colors">
              For Merchants
            </Link>
            <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
            {authenticated && (
              <Link href="/launch/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            )}
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
                <span className="text-sm text-muted-foreground">{user?.email?.address || "Connected"}</span>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={login} className="glow-hover bg-primary hover:bg-secondary">
                Login
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
              <Link href="/launch/merchant" className="text-muted-foreground hover:text-foreground transition-colors">
                For Merchants
              </Link>
              <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                Help
              </Link>
              {authenticated && (
                <Link
                  href="/launch/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
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
