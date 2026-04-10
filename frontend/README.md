# Cardly - Frontend

Web application built with Next.js 15 (App Router), Tailwind CSS, and shadcn/ui.

## Tech Stack & Rationale

- **Next.js 15 (App Router)** — React framework with server-side rendering, which we need for shared card pages to have proper SEO and Open Graph meta tags (link previews on social media/messaging apps). App Router gives us layouts, loading states, and server components out of the box.
- **TypeScript** — catches type errors at compile time across the entire frontend. Shared types with the backend API responses reduce integration bugs.
- **Tailwind CSS** — utility-first CSS framework that speeds up development by keeping styles co-located with markup. No context-switching between component and stylesheet files. Highly customizable for the card editor where we need precise control over layouts and animations.
- **shadcn/ui** — pre-built, accessible UI components (buttons, modals, dropdowns, forms) built on top of Tailwind and Radix UI. Unlike Bootstrap, components are copied into the project and fully customizable — important for a card editor where we need creative flexibility beyond what a rigid component library allows.
- **Framer Motion** — animation library used for scroll-triggered reveals, parallax effects, and staggered entry animations on the landing page.
- **@react-oauth/google** — Google OAuth integration for browser-side sign-in flow.

## Project Structure

```
app/
├── page.tsx              # Marketing landing page
├── login/                # Sign in (Google OAuth + email/password)
├── register/             # Create account (Google OAuth + email/password)
├── cards/                # User's card list (grid view)
├── dashboard/            # Redirects to /cards
├── editor/
│   ├── new/              # Template picker → card editor
│   └── [id]/             # Edit existing card
└── cards/
    └── [id]/             # Public card view (shared link) — TBD

components/
├── ui/                   # shadcn/ui components (Button, Card, Accordion, Badge, etc.)
├── card/                 # Card editor with live preview and drag-to-reposition
├── landing/              # Landing page sections and marketing header
│   ├── Header.tsx        # Landing header (auth-aware: guest vs logged-in)
│   ├── AppHeader.tsx     # Authenticated app header (logo + avatar dropdown)
│   ├── HeroBanner.tsx    # Hero with scroll parallax
│   ├── Features.tsx      # Feature grid with glow borders
│   ├── HowItWorks.tsx    # 3-step flow with app mockups
│   ├── Pricing.tsx       # 3-tier pricing
│   ├── FAQ.tsx           # Accordion FAQ
│   ├── FooterCTA.tsx     # Final call-to-action
│   ├── Footer.tsx        # Site footer
│   ├── ScrollReveal.tsx  # Intersection Observer fade-in animation
│   ├── ContainerScroll.tsx # Framer Motion scroll parallax
│   ├── GlowingEffect.tsx # Mouse-tracking conic gradient border
│   └── CardPreviewMock.tsx # Editor preview mock for hero section
└── Providers.tsx         # GoogleOAuthProvider + AuthProvider wrapper

lib/
├── api.ts                # apiFetch utility (credentials, 429 retry)
├── auth-context.tsx      # AuthProvider with user state, logout, refresh
└── utils.ts              # cn() class name utility
```

## Prerequisites

- Node.js 20+
- Backend API running (see `backend/README.md` for Docker setup)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp ../.env .env.local
# Ensure NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_API_URL are set

# Start development server
npm run dev
```

The frontend runs on `http://localhost:3000` and expects the backend API at `http://localhost:3001`.

## Pages

| Route | Description | Auth Required |
|-------|-------------|--------------|
| `/` | Marketing landing page (hero, features, pricing, FAQ) | No |
| `/login` | Sign in with Google or email/password | No |
| `/register` | Create account with Google or email/password | No |
| `/cards` | User's card grid with thumbnails, edit/view/delete actions | Yes |
| `/editor/new` | Pick a template, then edit card | Yes |
| `/editor/:id` | Edit existing card with live preview | Yes |
| `/cards/:id` | Public card view (shared link) | No (password if set) |
| `/dashboard` | Redirects to `/cards` | — |

## Headers

The app uses two different headers:

- **Landing Header** (`Header.tsx`) — used on `/`. Shows section anchor links (Features, Pricing, FAQ). Auth-aware: guests see "Log in" + "Start free", logged-in users see "My Cards" button.
- **App Header** (`AppHeader.tsx`) — used on `/cards` and `/editor/*`. Shows logo + user email + avatar initials badge. Clicking the avatar opens a dropdown with "Manage Account" and "Log out".

Login and register pages have no header — they are standalone screens with the Cardly logo linking back to `/`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:3001`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID for browser-side login |
