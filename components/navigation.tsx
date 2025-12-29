"use client"

import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { MapPin, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const { login, logout, authenticated, user } = usePrivy()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/launch" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">KyraQuest</span>
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
