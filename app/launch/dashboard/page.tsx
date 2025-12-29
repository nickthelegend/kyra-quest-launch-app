"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePrivy } from "@privy-io/react-auth"
import Link from "next/link"
import { Plus, Pause, Play, StopCircle } from "lucide-react"

export default function DashboardPage() {
  const { authenticated, login } = usePrivy()

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-8">{"Please log in to view your dashboard"}</p>
            <Button onClick={login} className="bg-primary hover:bg-secondary">
              Login with Privy
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Mock quest data
  const quests = [
    {
      id: 1,
      name: "Downtown Treasure Hunt",
      type: "Map Hunt",
      status: "active",
      claims: 45,
      maxClaims: 100,
      remaining: "2.5 ETH",
    },
    {
      id: 2,
      name: "Coffee Shop Loyalty",
      type: "QR Scan",
      status: "active",
      claims: 128,
      maxClaims: 500,
      remaining: "850 KYRA",
    },
    {
      id: 3,
      name: "Community Airdrop",
      type: "Verification",
      status: "paused",
      claims: 234,
      maxClaims: 1000,
      remaining: "5000 KYRA",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Manage your quests and rewards</p>
            </div>
            <Link href="/launch/create">
              <Button className="gap-2 bg-primary hover:bg-secondary glow-hover">
                <Plus className="w-4 h-4" />
                Create Quest
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {quests.map((quest) => (
              <Card
                key={quest.id}
                className="p-6 bg-card border-border hover:border-primary/50 transition-all glow-hover"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{quest.name}</h3>
                      <Badge
                        variant={quest.status === "active" ? "default" : "secondary"}
                        className={quest.status === "active" ? "bg-primary" : "bg-muted"}
                      >
                        {quest.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{quest.type}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Claims: </span>
                        <span className="text-foreground font-medium">
                          {quest.claims} / {quest.maxClaims}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Remaining: </span>
                        <span className="text-foreground font-medium">{quest.remaining}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {quest.status === "active" ? (
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Pause className="w-4 h-4" />
                        Pause
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <Play className="w-4 h-4" />
                        Resume
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                    >
                      <StopCircle className="w-4 h-4" />
                      End
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
