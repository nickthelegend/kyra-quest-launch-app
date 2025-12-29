"use client"

import type React from "react"

import { PrivyProvider } from "@privy-io/react-auth"
import { base, mainnet, optimism, arbitrum, polygon, mantleSepoliaTestnet } from "viem/chains"
import { PRIVY_APP_ID } from "./constants"

export function PrivyClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#6241E8",
        },
        supportedChains: [base, mainnet, optimism, arbitrum, polygon, mantleSepoliaTestnet],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ["email", "wallet"],
      }}
    >
      {children}
    </PrivyProvider>
  )
}
