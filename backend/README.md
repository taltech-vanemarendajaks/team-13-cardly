# Cardly Backend

REST API built with NestJS, Prisma ORM, and PostgreSQL.

## Tech Stack

- **NestJS** — modular Node.js framework with dependency injection
- **Prisma ORM** — type-safe database client with migrations
- **PostgreSQL** — relational database (runs via Docker)
- **Passport.js** — Google OAuth 2.0 strategy
- **JWT** — access + refresh token authentication
- **bcrypt** — refresh token hashing

## Project Structure

```
src/
├── main.ts                 # Bootstrap (CORS, cookie-parser, validation pipe)
├── app.module.ts           # Root module (ConfigModule, PrismaModule, AuthModule, UsersModule)
├── auth/
│   ├── auth.controller.ts  # /auth/* endpoints
│   ├── auth.service.ts     # Token generation, validation, Google OAuth, refresh flow
│   ├── auth.module.ts      # Wires Passport, JWT, strategies, guards
│   ├── strategies/
│   │   ├── google.strategy.ts  # Passport Google OAuth2 strategy
│   │   └── jwt.strategy.ts     # Passport JWT strategy (reads access token from header)
│   ├── guards/
│   │   ├── google-auth.guard.ts
│   │   └── jwt-auth.guard.ts
│   ├── interfaces/
│   │   ├── auth-user.interface.ts
│   │   └── jwt-payload.interface.ts
│   ├── dto/
│   │   └── refresh-token.dto.ts
│   └── constants/
│       └── auth.constants.ts    # Cookie name constant
├── users/
│   ├── users.module.ts
│   └── users.service.ts    # findOrCreateGoogleUser, saveRefreshTokenHash, etc.
├── prisma/
│   ├── prisma.module.ts    # Global Prisma module
│   └── prisma.service.ts   # PrismaClient with adapter-pg
├── cards/                  # Card CRUD (TBD)
├── media/                  # Media upload (TBD)
├── controller/
│   └── health.controller.ts  # GET /health
└── common/                 # Shared filters, interceptors (TBD)

prisma/
├── schema.prisma           # Database models (User, Card, Media)
└── migrations/             # Prisma migration history
```

## Getting Started

From the project root:

```bash
cp .env.example .env
# Fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, JWT_REFRESH_SECRET
docker compose up
```

Backend: `http://localhost:3001`
Database: `localhost:5432`

To run migrations manually:

```bash
docker compose exec backend npx prisma migrate deploy
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/auth/google` | Starts Google OAuth flow |
| GET | `/auth/google/callback` | Sets refresh cookie, redirects to frontend |
| POST | `/auth/refresh` | Rotates refresh token, returns new access token |
| POST | `/auth/logout` | Clears cookie, invalidates stored refresh hash |
| GET | `/auth/profile` | Returns authenticated user profile (requires JWT) |

### Other

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Health check |

### Cards (TBD)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/cards` | List user's cards |
| POST | `/cards` | Create new card |
| GET | `/cards/:id` | Get card by ID |
| PATCH | `/cards/:id` | Update card |
| DELETE | `/cards/:id` | Delete card |
| GET | `/cards/:id/public` | Public card view |

## Auth Cookie Flow

1. `GET /auth/google` → redirects to Google consent screen
2. `GET /auth/google/callback` → validates Google profile, creates/finds user, sets refresh token as `HttpOnly` cookie, redirects to frontend
3. Frontend calls `POST /auth/refresh` with `credentials: 'include'` → rotates refresh cookie, returns short-lived access token
4. Frontend stores access token in memory only (never localStorage)
5. `POST /auth/logout` → clears cookie, invalidates hashed refresh token in database

## Database Schema

```
User
├── id            UUID (PK)
├── email         String (unique)
├── name          String?
├── googleId      String (unique)
├── avatarUrl     String?
├── refreshTokenHash  String?
├── createdAt     DateTime
└── updatedAt     DateTime

Card
├── id            UUID (PK)
├── title         String
├── template      String?
├── content       JSON (background, text elements, positions)
├── thumbnailUrl  String?
├── password      String? (bcrypt hash)
├── isPublic      Boolean (default: true)
├── scheduledAt   DateTime?
├── userId        FK → User
├── createdAt     DateTime
└── updatedAt     DateTime

Media
├── id            UUID (PK)
├── url           String (S3/R2 URL)
├── type          String ("image" | "audio")
├── filename      String
├── size          Int
├── cardId        FK → Card
└── createdAt     DateTime
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_ACCESS_EXPIRY` | Access token lifetime (default: `15m`) |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime (default: `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL (default: `http://localhost:3001/auth/google/callback`) |
| `FRONTEND_URL` | Frontend URL for CORS and redirect (default: `http://localhost:3000`) |
| `BCRYPT_SALT_ROUNDS` | bcrypt rounds for refresh token hashing (default: `10`) |

## Local Development

- Cookie `secure` is `false` so `http://localhost` works
- Cookie `sameSite` is `lax`
- CORS allows credentials from `FRONTEND_URL`
- Prisma migrations run automatically on Docker container start

## Production

- Cookie `secure` must be `true`
- Cookie `sameSite` is `none` for cross-site deployments
- Backend must be served over HTTPS
- Set `FRONTEND_URL` to the production frontend URL
