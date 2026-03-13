# Cardly - Backend

REST API built with NestJS, Prisma ORM, and PostgreSQL.

## Tech Stack & Rationale

- **NestJS** — provides a structured, modular architecture out of the box with built-in support for dependency injection, guards, and interceptors. Well-suited for a REST API that needs clear separation between auth, cards, media, and user modules.
- **Prisma** — type-safe ORM that generates TypeScript types from the database schema, catching data-related bugs at compile time. Migration system makes schema changes trackable and reproducible.
- **PostgreSQL** — reliable relational database with native JSON column support, which we use to store flexible card content (texts, positions, styles, animations) without needing a separate document store.
- **JWT (access + refresh tokens)** — stateless authentication that scales without server-side session storage. Short-lived access tokens (15min) limit exposure if compromised; refresh tokens (7 days) keep users logged in.
- **Google OAuth 2.0** — eliminates the need to build and maintain password registration, hashing, reset flows, and 2FA. Simpler for users (one-click login) and for us (less security surface area).
- **Cloudflare R2 / AWS S3** (TBD) — object storage for user-uploaded images and audio. Keeps binary files out of the database and serves them via CDN. R2 has no egress fees; S3 has a broader ecosystem.

## Project Structure

```
src/
├── auth/           # Google OAuth, JWT strategy, guards
├── users/          # User profile endpoints
├── cards/          # Card CRUD + sharing endpoints
├── media/          # File upload/delete (S3/R2)
└── common/         # Exception filters, interceptors
```

## Prerequisites

- Docker and Docker Compose

## Getting Started

All backend services (API + PostgreSQL) are started via Docker Compose from the project root:

```bash
# From the project root directory
cp .env.example .env          # Configure environment variables
docker compose up              # Starts PostgreSQL + backend
```

The backend runs on `http://localhost:3001` and PostgreSQL on `localhost:5432`.

To run database migrations inside the container:

```bash
docker compose exec backend npx prisma migrate dev
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /auth/google | Initiate Google OAuth flow |
| GET | /auth/google/callback | Google OAuth callback |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Invalidate refresh token |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/me | Get current user profile |
| PATCH | /users/me | Update display name |

### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /cards | List current user's cards |
| POST | /cards | Create new card |
| GET | /cards/:id | Get card (owner only) |
| PATCH | /cards/:id | Update card |
| DELETE | /cards/:id | Delete card |
| GET | /cards/:id/public | View shared card |
| POST | /cards/:id/verify-password | Verify card password |
| GET | /cards/:id/qr | Generate QR code |
| GET | /cards/:id/embed | Get iframe embed code |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /media/upload | Upload image or audio |
| DELETE | /media/:id | Delete uploaded file |

## Database

Schema is defined in `prisma/schema.prisma`. Three models:

- **User** — Google OAuth profile (email, name, googleId, avatar)
- **Card** — card content stored as JSON for flexible structure, optional bcrypt-hashed password protection, optional scheduled reveal time
- **Media** — references to uploaded files in S3/R2 (images and audio)
