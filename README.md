# Cardly

A web application for creating and sharing interactive greeting cards.

## Tech Stack

| Component | Technology |
| --- | --- |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | NestJS + TypeScript + Prisma ORM |
| Database | PostgreSQL |
| Auth | Google OAuth 2.0 + JWT |
| Payments | Stripe (subscriptions) |
| Animations | Framer Motion |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+

### 1. Set up environment

```bash
cp .env.example .env
```

Fill in the required variables. Ask a teammate for the shared Stripe and Google OAuth keys.

### 2. Start the backend and database

```bash
docker compose up -d --build backend
```

Backend API: `http://localhost:3001`

### 3. Start the frontend

```bash
cd frontend
npm install
cp ../.env .env.local
npm run dev
```

Frontend: `http://localhost:3000`

### 4. Stripe (optional for webhooks)

Stripe subscriptions work **without** running `stripe listen`. After checkout, the app calls Stripe's API directly to verify and activate the subscription.

If you want real-time webhook updates (e.g., background cancellations, payment failures), install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:

```bash
stripe login
stripe listen --forward-to localhost:3001/billing/webhook
```

Copy the webhook secret (`whsec_...`) to `STRIPE_WEBHOOK_SECRET` in `.env` and rebuild the backend.

### Test card for Stripe

- **Number:** `4242 4242 4242 4242`
- **Expiry:** `12/30`
- **CVC:** `123`

## Pages

| Route | Description | Auth |
| --- | --- | --- |
| `/` | Marketing landing page (hero, features, pricing, FAQ) | No |
| `/login` | Sign in with Google OAuth or email/password | No |
| `/register` | Create account | No |
| `/cards` | User's card list with grid view | Yes |
| `/editor/new` | Template picker → card editor | Yes |
| `/editor/[id]` | Edit existing card | Yes |
| `/admin` | Admin panel (users, stats, plan management) | ADMIN_KEY |

## Environment Variables

Get the shared keys from a teammate and add them to your `.env`. See `.env.example` for all variables.

| Variable | Used by | Required | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Backend | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Yes | Access token signing secret |
| `GOOGLE_CLIENT_ID` | Backend | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Backend | Yes | Google OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Frontend | Yes | Same Google client ID (for browser) |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | Backend URL (default: `http://localhost:3001`) |
| `FRONTEND_URL` | Backend | Yes | Frontend URL (default: `http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Backend | Yes | Stripe test secret key (shared) |
| `STRIPE_PRO_PRICE_ID` | Backend | Yes | Stripe price ID for Pro plan (shared) |
| `STRIPE_BUSINESS_PRICE_ID` | Backend | Yes | Stripe price ID for Business plan (shared) |
| `STRIPE_WEBHOOK_SECRET` | Backend | No | Only needed if running `stripe listen` locally |
| `ADMIN_KEY` | Backend | No | Secret key for `/admin` panel access |

## Admin Panel

Visit `/admin` and enter the `ADMIN_KEY` value. From there you can:
- View total users, cards, paid users, MRR
- Search and browse all users
- Change a user's plan
- View and delete user cards
- Delete user accounts

## Documentation

- [Development Workflow](DEVELOPMENT_WORKFLOW.md)
- [Backend README](backend/README.md)
