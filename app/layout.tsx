import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PrivyClientProvider } from "@/lib/privy-provider"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "KyraQuest Launch - Creator & Merchant Launchpad",
  description:
    "Launch quests, airdrops, and loyalty rewards on maps. Built for creators, merchants, and Web3 projects.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}>
        <PrivyClientProvider>{children}</PrivyClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
