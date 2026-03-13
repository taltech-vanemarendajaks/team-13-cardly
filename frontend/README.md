# Cardly - Frontend

Web application built with Next.js 15 (App Router), Tailwind CSS, and shadcn/ui.

## Tech Stack & Rationale

- **Next.js 15 (App Router)** — React framework with server-side rendering, which we need for shared card pages to have proper SEO and Open Graph meta tags (link previews on social media/messaging apps). App Router gives us layouts, loading states, and server components out of the box.
- **TypeScript** — catches type errors at compile time across the entire frontend. Shared types with the backend API responses reduce integration bugs.
- **Tailwind CSS** — utility-first CSS framework that speeds up development by keeping styles co-located with markup. No context-switching between component and stylesheet files. Highly customizable for the card editor where we need precise control over layouts and animations.
- **shadcn/ui** — pre-built, accessible UI components (buttons, modals, dropdowns, forms) built on top of Tailwind and Radix UI. Unlike Bootstrap, components are copied into the project and fully customizable — important for a card editor where we need creative flexibility beyond what a rigid component library allows.

## Project Structure

```
app/
├── page.tsx              # Landing page
├── login/                # Google sign-in
├── dashboard/            # User's cards list
├── editor/
│   ├── new/              # Create new card
│   └── [id]/             # Edit existing card
└── cards/
    └── [id]/             # Public card view (shared link)

components/
├── ui/                   # Reusable UI components (shadcn/ui)
├── card/                 # Card-related (editor, preview, template selector)
└── layout/               # Header, footer, sidebar

lib/
├── api.ts                # API client with token auto-refresh
├── auth.ts               # Token storage and auth helpers
└── utils.ts              # Shared utilities

types/
└── index.ts              # Shared TypeScript interfaces

public/
└── templates/            # Default card template images
```

## Prerequisites

- Node.js 20+
- Backend API running (see `backend/README.md` for Docker setup)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp ../.env.example .env.local

# Start development server
npm run dev
```

The frontend runs on `http://localhost:3000` and expects the backend API at `http://localhost:3001`.

## Pages

| Route | Description | Auth Required |
|-------|-------------|--------------|
| `/` | Landing page | No |
| `/login` | Google sign-in | No |
| `/dashboard` | User's cards list | Yes |
| `/editor/new` | Create new card | Yes |
| `/editor/:id` | Edit existing card | Yes |
| `/cards/:id` | Public card view | No (password if set) |
