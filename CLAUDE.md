# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Huch is a CS2 (Counter-Strike 2) skin loan platform that allows users to borrow money using their CS2 skins as collateral. The application is built with Next.js 15, TypeScript, and integrates with Solana blockchain for payments.

## Development Commands

```bash
npm run dev    # Start development server on http://localhost:3000
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

Note: There are currently no test commands as the project has no testing infrastructure set up.

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives wrapped in custom components (shadcn/ui pattern)
- **Authentication**: Privy for Web3/Web2 auth with Steam integration
- **Blockchain**: Solana (Anchor framework, SPL tokens)
- **State Management**: React hooks and context

### Key Directories
- `/app` - Next.js App Router pages and API routes
- `/components/ui` - Base UI components (shadcn/ui style)
- `/components/auth` - Authentication components including Privy and Steam
- `/components/borrow` - Borrowing flow components
- `/hooks` - Custom React hooks including `useAuth`
- `/lib` - Utilities and configurations

### Authentication Flow
The app uses Privy for authentication with custom Steam OpenID integration:
1. Users can login via email, Google, or Solana wallet
2. Steam accounts are linked through `/api/auth/steam-callback`
3. User profiles include: id, email, wallet, steamId, username, avatar, tradeLink
4. Authentication state is managed by the `useAuth` hook

### API Integration
- Backend API runs on `http://localhost:3333/api/`
- Authentication uses `X-Privy-Id` header
- Main endpoints: `/users`, `/users/register`, `/users/update`

### Environment Variables
- `NEXT_PUBLIC_PRIVY_APP_ID` - Privy app ID (has fallback)
- `STEAM_API_KEY` - Required for Steam profile fetching

### Key Features
1. **Borrow Page** - Multi-step flow for borrowing against CS2 skins
2. **Trade Page** - TradingView widget integration
3. **Profile/Settings** - User profile and Steam trade link management
4. **Ranking System** - Leaderboard for users
5. **Admin Panel** - Admin-only features at `/admin`

### Important Patterns
- All protected routes require authentication via `AuthRequired` component
- Solana wallet creation happens automatically for users without wallets
- Steam inventory fetching uses the `use-steam-inventory` hook
- Loading states use custom overlay components
- Dark theme with cyberpunk aesthetic throughout

### Development Notes
- The project uses absolute imports with `@/` prefix
- No testing infrastructure currently exists
- Images are optimized for Steam CDN domains
- Webpack fallbacks configured for browser compatibility