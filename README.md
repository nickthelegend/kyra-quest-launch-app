# KyraQuest Launch

> **A creator & merchant launchpad for on-chain quests, token rewards, and map-based treasure hunts on Mantle.**

## Overview

KyraQuest Launch is a Next.js web app that lets creators, merchants, and Web3 projects spin up gamified reward campaigns backed by smart contracts. Organizers create a quest, fund it with an existing or freshly-minted ERC-20 token, and players complete it by scanning a QR code, visiting a geo-fenced location on a map, or passing a verification step to claim their reward on-chain.

The project pairs a set of Solidity contracts (a quest factory, a token factory, and reward/NFT contracts deployed on Mantle Sepolia) with a Supabase-backed indexing and progression layer (players, XP, levels, quest claims, and merchant verification). It's aimed at brands and local merchants who want to drive real-world engagement and foot traffic through token-incentivized experiences.

## Features

- **Quest launchpad** — Create quests through an on-chain `QuestFactory`, tracked per creator, with configurable reward amount, max claims, and expiry.
- **Multiple quest types** — Map-based (geo-fenced), QR-code redemption, and verification quests.
- **Token launchpad** — Deploy custom ERC-20 reward tokens via a `TokenFactory` (built on OpenZeppelin `ERC20` / `ERC20Burnable` / `Ownable`), or reward with the built-in KYRA token.
- **QR verification & redemption** — In-app QR scanning and QR-code generation for merchant and event redemptions.
- **Interactive map** — Google Maps-based discovery of nearby quests.
- **Merchant hub** — Merchant verification flow, verified badges, and a dedicated merchant dashboard.
- **Player progression** — XP, levels, quest-claim history, and a leaderboard, indexed in Supabase.
- **NFT rewards** — Quest NFT / Quest Reel NFT contracts for collectible rewards.
- **Wallet & auth** — Privy authentication with embedded wallets, plus account-abstraction tooling (`permissionless`, Abstract Global Wallet).
- **IPFS uploads** — Media/metadata pinning via Pinata.
- **Extra surfaces** — Feed, profile, shop, and token explorer pages.

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling / UI:** Tailwind CSS v4, Radix UI, shadcn-style components, Framer Motion, Lucide icons
- **Web3 (frontend):** viem, ethers, Privy (`@privy-io/react-auth`), `permissionless`, Abstract Global Wallet (`@abstract-foundation/agw-client`)
- **Smart contracts:** Solidity 0.8.20, Hardhat, OpenZeppelin, Hardhat Ignition — deployed to Mantle Sepolia
- **Backend / data:** Supabase (Postgres) with SQL migrations
- **Storage:** Pinata (IPFS)
- **Maps:** Google Maps
- **Analytics:** Vercel Analytics

## Getting Started

### Prerequisites

- Node.js 18+
- `pnpm` (a `pnpm-lock.yaml` is committed)
- A Supabase project and (for on-chain features) access to Mantle Sepolia

### Run the web app

```bash
# install dependencies
pnpm install

# configure environment (Supabase, etc.)
# create .env.local with:
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# start the dev server
pnpm dev

# production build
pnpm build
pnpm start
```

The app is served from `/launch` (the root `/` redirects there).

### Database

Apply the schema and migrations in `supabase/` to your Supabase project (`supabase/schema.sql` and the ordered files in `supabase/migrations/`).

### Smart contracts

```bash
cd contract-project
npm install
npx hardhat compile
# deploy with Hardhat Ignition (see contract-project/ignition and scripts/)
```

## Project Structure

```
app/                  Next.js routes (launch, quests, map, leaderboard,
                      merchant, profile, shop, tokens, feed, help, download)
components/           Shared UI (navigation, modals) + shadcn-style ui/
contracts/            Solidity sources + compiled ABIs (abis/)
contract-project/     Hardhat workspace (contracts, ignition, scripts, tests)
hooks/                React hooks (network, mobile, toast)
lib/                  Supabase, Privy provider, Pinata, constants, utils
supabase/             schema.sql + ordered SQL migrations
scripts/              Utility scripts (e.g. signer generation)
public/               Static assets
```

---

Built by [nickthelegend](https://github.com/nickthelegend) · [nickthelegend.tech](https://nickthelegend.tech)
