# Cardly

A web application for creating and sharing interactive greeting cards.

## Tech Stack

| Component | Technology |
| --- | --- |
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | NestJS + TypeScript + Prisma ORM |
| Database | PostgreSQL |
| Auth | Google OAuth 2.0 + JWT |
| File Storage | Cloudflare R2 or AWS S3 |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+

### Start the backend and database

```bash
cp .env.example .env
docker compose up
```

Backend API: `http://localhost:3001`

### Start the frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`

## Auth Flow

- `GET /auth/google` starts Google OAuth in the browser.
- `GET /auth/google/callback` sets the refresh token as an `HttpOnly` cookie and redirects back to the frontend.
- After redirect, the frontend should call `POST /auth/refresh` with `credentials: 'include'` to get a short-lived access token and keep it in memory only.
- In local development, the refresh-token cookie uses `secure=false` so localhost works.
- In production, the refresh-token cookie must use `secure=true`.

## Documentation

- [Project Plan](PROJECT_PLAN.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
