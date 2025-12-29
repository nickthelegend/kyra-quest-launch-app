import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { QrCode, Store, Award, Zap, Shield, TrendingUp } from "lucide-react"

export default function MerchantPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium text-secondary uppercase tracking-wider">
                For Merchants & Businesses
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance leading-tight">
              Loyalty rewards for the
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Web3 generation
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              {"Turn every customer interaction into a rewarding experience. No crypto knowledge required."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/launch/create">
                <Button size="lg" className="glow-hover bg-primary hover:bg-secondary text-lg px-8">
                  Launch Campaign
                </Button>
              </Link>
              <Link href="/merchant/verify">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  Verify Merchant Status
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-card border-border glow-hover">
              <QrCode className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Simple QR Drops</h3>
              <p className="text-muted-foreground text-pretty">
                {
                  "Print QR codes at your venue. Customers scan and instantly receive tokens, NFTs, or redeemable vouchers."
                }
              </p>
            </Card>

            <Card className="p-8 bg-card border-border glow-hover">
              <Store className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Location-Based</h3>
              <p className="text-muted-foreground text-pretty">
                {"Create geo-fenced campaigns. Reward customers when they visit your physical location."}
              </p>
            </Card>

            <Card className="p-8 bg-card border-border glow-hover">
              <Award className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Loyalty Programs</h3>
              <p className="text-muted-foreground text-pretty">
                {"Build lasting relationships with blockchain-based loyalty points and exclusive NFT badges."}
              </p>
            </Card>

            <Card className="p-8 bg-card border-border glow-hover">
              <Zap className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Instant Redemption</h3>
              <p className="text-muted-foreground text-pretty">
                {"No delays, no friction. Customers receive and redeem rewards in real-time via their wallet."}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="p-12 bg-gradient-to-br from-card to-primary/5 border-primary/20 glow-primary">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Merchants Choose KyraQuest</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-foreground mb-2">No Crypto Needed</h4>
                <p className="text-sm text-muted-foreground">We handle all the blockchain complexity</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="font-bold text-foreground mb-2">Boost Engagement</h4>
                <p className="text-sm text-muted-foreground">60% increase in repeat visits</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-foreground mb-2">Launch in Minutes</h4>
                <p className="text-sm text-muted-foreground">Quick setup, no technical skills</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {"Ready to transform your customer loyalty?"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {"Join leading restaurants, hotels, and retail stores on KyraQuest."}
          </p>
          <Link href="/launch/create">
            <Button size="lg" className="glow-hover bg-primary hover:bg-secondary text-lg px-8">
              Launch Your First Campaign
            </Button>
          </Link>
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
              <Link href="/launch" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Launch Platform
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
