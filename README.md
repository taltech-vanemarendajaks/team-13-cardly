# Cardly

A web application for creating and sharing interactive greeting cards. Build cards with custom images, text, music, and animations — then share them via link, QR code, or embed on any website.

## Features

- **Google sign-in** — one-click authentication
- **Card editor** — build cards with text, images, audio, and animations
- **Default templates** — birthday, Christmas, New Year, Valentine's Day, and more
- **Custom uploads** — use your own images or choose from our library
- **Password protection** — restrict access to private cards
- **Sharing** — shareable link, QR code generation, iframe embed code
- **Dashboard** — manage all your cards in one place

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | NestJS + TypeScript + Prisma ORM |
| Database | PostgreSQL |
| Auth | Google OAuth 2.0 + JWT |
| File Storage | Cloudflare R2 or AWS S3 |

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed tech stack rationale, architecture, and implementation phases.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+

### 1. Start the backend and database

```bash
cp .env.example .env          # Configure environment variables
docker compose up              # Starts PostgreSQL + NestJS backend
```

Backend API: `http://localhost:3001`

### 2. Start the frontend

```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`

## Project Structure

```
cardly/
├── frontend/          # Next.js 15 (App Router) — see frontend/README.md
├── backend/           # NestJS REST API — see backend/README.md
├── docker-compose.yml # PostgreSQL + backend services
├── PROJECT_PLAN.md    # Full project plan and architecture
└── .env.example       # Environment variable template
```

## Documentation

- [Project Plan](PROJECT_PLAN.md) — features, architecture, database schema, API endpoints, implementation phases
- [Backend README](backend/README.md) — API setup, endpoints, tech rationale
- [Frontend README](frontend/README.md) — UI setup, pages, tech rationale
