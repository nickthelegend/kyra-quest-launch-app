import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { HelpCircle, Map, QrCode, CheckCircle2, Wallet, Award, ChevronRight } from "lucide-react"

export default function HelpPage() {
  const faqs = [
    {
      question: "What is KyraQuest?",
      answer:
        "KyraQuest is a creator and merchant launchpad that enables you to create engaging quests, airdrops, and loyalty reward campaigns on maps using blockchain technology.",
    },
    {
      question: "Do I need crypto experience?",
      answer:
        "No! KyraQuest handles all the blockchain complexity for you. Simply create your campaign and we take care of the rest.",
    },
    {
      question: "What types of rewards can I offer?",
      answer: "You can offer ERC20 tokens, ERC1155 NFTs, redeemable merchant vouchers, and Proof-of-Attendance NFTs.",
    },
    {
      question: "How do players claim rewards?",
      answer:
        "Players use their Privy wallet (created automatically) to claim rewards. They can use social login or email - no crypto wallet needed!",
    },
    {
      question: "What blockchain does KyraQuest use?",
      answer: "KyraQuest is built on Mantle Network, an EVM-compatible blockchain with low fees and fast transactions.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Help & Documentation</h1>
            <p className="text-lg text-muted-foreground">{"Everything you need to know about KyraQuest"}</p>
          </div>

          {/* Quick Start Guide */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Quest Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all">
                <Map className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Map Hunt</h3>
                <p className="text-sm text-muted-foreground">
                  {"Create geo-fenced areas where players can claim rewards by visiting physical locations."}
                </p>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-secondary/50 transition-all">
                <QrCode className="w-10 h-10 text-secondary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">QR Scan</h3>
                <p className="text-sm text-muted-foreground">
                  {"Print QR codes that players scan to instantly receive rewards at your venue."}
                </p>
              </Card>

              <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all">
                <CheckCircle2 className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">Verification</h3>
                <p className="text-sm text-muted-foreground">
                  {"Simple airdrops based on identity verification with one claim per user."}
                </p>
              </Card>
            </div>
          </section>

          {/* How It Works */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">How It Works</h2>
            <div className="space-y-4">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Create Your Quest</h3>
                    <p className="text-muted-foreground">
                      {
                        "Choose your quest type, set rewards, configure rules, and define locations or verification requirements."
                      }
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Players Discover</h3>
                    <p className="text-muted-foreground">
                      {"Players find your quest on the map, through QR codes, or via shared links."}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Claim Rewards</h3>
                    <p className="text-muted-foreground">
                      {"Players complete requirements and instantly receive tokens or NFTs in their embedded wallet."}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Wallet & Privy */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Wallet & Authentication</h2>
            <Card className="p-8 bg-gradient-to-br from-card to-primary/5 border-primary/20">
              <div className="flex items-start gap-4 mb-6">
                <Wallet className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">Powered by Privy</h3>
                  <p className="text-muted-foreground mb-4">
                    {
                      "KyraQuest uses Privy for secure, user-friendly authentication. Users can log in with email, Google, Twitter, or Discord - no crypto wallet needed!"
                    }
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      Embedded wallet automatically created on first login
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      Optional external wallet connection (MetaMask, WalletConnect)
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      Secure and non-custodial - you control your assets
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Merchant Redemption */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Merchant Redemption Flow</h2>
            <Card className="p-8 bg-card border-border">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Step 1: Customer Claims</h4>
                    <p className="text-sm text-muted-foreground">
                      {"Customer scans QR code or completes quest to receive redeemable token/voucher"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Step 2: Present at Store</h4>
                    <p className="text-sm text-muted-foreground">
                      {"Customer shows digital voucher in their KyraQuest wallet at your location"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground mb-1">Step 3: Verify & Redeem</h4>
                    <p className="text-sm text-muted-foreground">
                      {"Merchant scans verification code to confirm and redeem the reward"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6 bg-card border-border">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
