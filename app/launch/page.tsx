import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Map, QrCode, CheckCircle2, TrendingUp, Users, Award } from "lucide-react"

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium text-secondary uppercase tracking-wider">
                Creator & Merchant Launchpad
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground text-balance leading-tight">
              Launch quests, airdrops,
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                and loyalty rewards
              </span>
              <br />
              on maps.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              {
                "Build engaging experiences for your community with map-based treasure hunts, QR code redemptions, and verification-only airdrops."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/launch/create">
                <Button size="lg" className="glow-hover bg-primary hover:bg-secondary text-lg px-8">
                  Launch a Quest
                </Button>
              </Link>
              <Link href="/launch/merchant">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  For Merchants
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 bg-card border-border glow-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">1,247</div>
                  <div className="text-sm text-muted-foreground">Active Quests</div>
                </div>
              </div>
            </Card>
            <Card className="p-8 bg-card border-border glow-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">$2.4M</div>
                  <div className="text-sm text-muted-foreground">Total Rewards Claimed</div>
                </div>
              </div>
            </Card>
            <Card className="p-8 bg-card border-border glow-hover">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">89.3K</div>
                  <div className="text-sm text-muted-foreground">Active Players</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Quest Types */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Quest Types</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {"Choose the perfect quest format for your audience"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all glow-hover group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 glow-primary group-hover:scale-110 transition-transform">
                <Map className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Map Hunt</h3>
              <p className="text-muted-foreground text-pretty">
                {"Create geo-fenced treasure hunts. Players explore physical locations to unlock rewards."}
              </p>
            </Card>

            <Card className="p-8 bg-card border-border hover:border-secondary/50 transition-all glow-hover group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center mb-6 glow-primary group-hover:scale-110 transition-transform">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">QR Scan</h3>
              <p className="text-muted-foreground text-pretty">
                {"Perfect for merchants. Print QR codes and reward customers instantly when they scan."}
              </p>
            </Card>

            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all glow-hover group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 glow-primary group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Verification</h3>
              <p className="text-muted-foreground text-pretty">
                {"Simple airdrops based on identity or account verification. One claim per user."}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 bg-gradient-to-br from-card to-primary/5 border-primary/20 glow-primary text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {"Ready to launch your first quest?"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {"Join thousands of creators and merchants building engaging Web3 experiences."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/launch/create">
                <Button size="lg" className="glow-hover bg-primary hover:bg-secondary text-lg px-8">
                  Create Quest
                </Button>
              </Link>
              <Link href="/launch/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">© 2025 KyraQuest. Built on Mantle Network.</div>
            <div className="flex items-center gap-6">
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Help & Docs
              </Link>
              <Link
                href="/launch/merchant"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Merchants
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
