# Cardly

A web application for creating and sharing interactive greeting cards.

## Tech Stack

| Component | Technology |
| --- | --- |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | NestJS + TypeScript + Prisma ORM |
| Database | PostgreSQL |
| Auth | Google OAuth 2.0 + JWT (access + refresh tokens) |
| Animations | Framer Motion |
| File Storage | Cloudflare R2 or AWS S3 (TBD) |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+

### Start the backend and database

```bash
cp .env.example .env
# Fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXT_PUBLIC_GOOGLE_CLIENT_ID
docker compose up
```

Backend API: `http://localhost:3001`

### Start the frontend

```bash
cd frontend
npm install
cp ../.env .env.local
# Ensure NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_API_URL are set
npm run dev
```

Frontend: `http://localhost:3000`

## Pages

| Route | Description | Auth |
| --- | --- | --- |
| `/` | Marketing landing page (hero, features, pricing, FAQ) | No |
| `/login` | Sign in with Google OAuth or email/password | No |
| `/register` | Create account with Google OAuth or email/password | No |
| `/cards` | User's card list with grid view | Yes |
| `/editor/new` | Template picker → card editor | Yes |
| `/editor/[id]` | Edit existing card | Yes |
| `/dashboard` | Redirects to `/cards` | — |

## Auth Flow

- `GET /auth/google` starts Google OAuth in the browser.
- `GET /auth/google/callback` sets the refresh token as an `HttpOnly` cookie and redirects back to the frontend.
- After redirect, the frontend calls `POST /auth/refresh` with `credentials: 'include'` to get a short-lived access token.
- Landing page header is auth-aware: shows "Log in / Start free" for guests, "My Cards" for authenticated users.
- In local development, the refresh-token cookie uses `secure=false` so localhost works.
- In production, the refresh-token cookie must use `secure=true`.

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Used by | Description |
| --- | --- | --- |
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Access token signing secret |
| `JWT_REFRESH_SECRET` | Backend | Refresh token signing secret |
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Backend | OAuth callback URL |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API URL (default: `http://localhost:3001`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Frontend | Google OAuth client ID for browser-side login |
| `FRONTEND_URL` | Backend | Frontend URL for CORS and OAuth redirects |

## Documentation

- [Development Workflow](DEVELOPMENT_WORKFLOW.md)
- [Backend README](backend/README.md)
