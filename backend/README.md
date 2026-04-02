# Cardly Backend

REST API built with NestJS, Prisma ORM, and PostgreSQL.

## Tech Stack

- NestJS
- Prisma
- PostgreSQL
- Google OAuth 2.0
- JWT access and refresh tokens

## Getting Started

From the project root:

```bash
cp .env.example .env
docker compose up
```

Backend: `http://localhost:3001`
Database: `localhost:5432`

To apply migrations:

```bash
docker compose exec backend npx prisma migrate dev
```

## Auth Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/auth/google` | Starts Google OAuth |
| GET | `/auth/google/callback` | Sets refresh cookie and redirects to the frontend |
| POST | `/auth/refresh` | Reads refresh token from cookie, rotates it, returns a new access token |
| POST | `/auth/logout` | Clears refresh cookie and invalidates the stored refresh token hash |
| GET | `/auth/profile` | Protected route for verifying `JwtAuthGuard` |

## Auth Cookie Flow

The backend now uses a production-style token transport:

- `/auth/google/callback` no longer returns raw access and refresh token JSON in the browser.
- The refresh token is stored in an `HttpOnly` cookie.
- The frontend should call `/auth/refresh` with `credentials: 'include'` after redirect.
- `/auth/refresh` rotates the refresh token cookie and returns a short-lived access token.
- The frontend should keep the access token in memory only.
- `/auth/logout` clears the cookie and invalidates the hashed refresh token in PostgreSQL.

## Local Development

- Cookie `secure` is `false` in development so `http://localhost` works.
- Cookie `sameSite` is `lax` in development.
- Backend CORS allows credentials for `http://localhost:3000` by default.
- Frontend requests to the backend must use `credentials: 'include'`.

Example frontend refresh request:

```ts
await fetch('http://localhost:3001/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});
```

## Production

- Cookie `secure` must be `true`.
- Cookie `sameSite` is `none` for cross-site frontend/backend deployments.
- Serve the backend over HTTPS.
- Frontend requests must continue using `credentials: 'include'`.

If needed, the redirect target can be overridden with `FRONTEND_URL`. If it is not set, the backend redirects to `http://localhost:3000`.

## Database

Schema is defined in `prisma/schema.prisma`.

- `User`: Google OAuth profile plus hashed refresh token
- `Card`: card content and sharing metadata
- `Media`: uploaded file references
