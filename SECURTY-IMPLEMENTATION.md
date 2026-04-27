# Security Implementation Overview

## 1. Purpose of This Document

This document describes the current security implementation for authentication and session handling in Cardly. It is intended to explain the actual runtime behavior of the system in detail, including:

- how JWT access tokens are issued and validated
- how refresh tokens are issued, stored, rotated, and revoked
- how Google OAuth works on the server side
- how the frontend stores and uses authentication state
- how cookies, headers, database persistence, and route protection work together
- what differs between local development and production behavior

This is not a high-level summary. It is the concrete implementation overview for the current codebase.

## 2. Security Goals

The auth system is built around these goals:

- keep the short-lived access token out of persistent browser storage
- keep the long-lived refresh token out of JavaScript access by storing it in an `HttpOnly` cookie
- protect authenticated API routes using bearer access tokens
- allow users to stay signed in through refresh-token rotation
- make logout revoke future refresh operations by invalidating the stored refresh-token hash
- move Google OAuth off the client-side token exchange pattern and onto a server-side redirect/callback flow

The resulting design is:

- access token: in memory only on the frontend
- refresh token: `HttpOnly` cookie, never exposed to frontend JavaScript
- refresh token persistence: hashed value stored in PostgreSQL
- protected API routes: `Authorization: Bearer <accessToken>`

## 3. Environment Variables Used by Security

The current implementation uses the following auth-related environment variables:

- `JWT_SECRET`
  - signing secret for access tokens
- `JWT_REFRESH_SECRET`
  - signing secret for refresh tokens
- `JWT_ACCESS_EXPIRY`
  - access-token lifetime
  - current expected value: `15m`
- `JWT_REFRESH_EXPIRY`
  - refresh-token lifetime
  - current expected value: `7d`
- `BCRYPT_SALT_ROUNDS`
  - bcrypt cost for hashing refresh tokens and password hashes
  - current expected value: `12`
- `GOOGLE_CLIENT_ID`
  - used by the server-side Google OAuth strategy when redirecting to Google
- `GOOGLE_CLIENT_SECRET`
  - used by the server-side Google OAuth strategy when exchanging the authorization code during callback
- `GOOGLE_CALLBACK_URL`
  - callback URL registered with Google and used by the backend strategy
- `FRONTEND_URL`
  - used by the backend when redirecting the browser back to the frontend after Google OAuth completes
- `NEXT_PUBLIC_API_URL`
  - used by the frontend when redirecting the browser to the backend Google auth entrypoint and when calling backend APIs

## 4. Data Model

Authentication depends on the `User` model in Prisma.

Relevant fields:

- `id`
  - internal application user id
- `email`
  - unique user identifier
- `googleId`
  - linked Google account id when user signed in with Google
- `passwordHash`
  - bcrypt password hash for local email/password auth
- `refreshTokenHash`
  - bcrypt hash of the currently valid refresh token
- `plan`
  - billing plan, returned in the auth user payload
- `stripeStatus`
  - returned in the auth user payload

Important point:

- only the refresh-token hash is stored in the database
- raw refresh tokens are never stored in plaintext
- access tokens are never stored in the database

## 5. Backend Auth Components

The backend auth implementation is concentrated in:

- `backend/src/auth/auth.module.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/google.strategy.ts`
- `backend/src/auth/guards/google-auth.guard.ts`
- `backend/src/auth/guards/jwt-auth.guard.ts`

### 5.1 Auth Module

`AuthModule` wires together:

- `PassportModule` with `session: false`
- `JwtModule`
- `AuthService`
- `GoogleStrategy`
- `GoogleAuthGuard`
- `JwtAuthGuard`

This means authentication is stateless from the server perspective. Passport is used only for Google OAuth strategy execution, not for server sessions.

### 5.2 Auth Controller

The controller owns:

- login and registration endpoints
- Google OAuth entrypoint and callback endpoints
- refresh endpoint
- logout endpoint
- authenticated profile endpoints
- refresh-cookie creation and clearing

### 5.3 Auth Service

The service owns:

- password login
- registration
- Google-user creation and linking
- access-token issuance
- refresh-token issuance
- refresh-token verification
- refresh-token hashing and persistence
- logout revocation
- authenticated user lookup

### 5.4 Google Strategy

The Google strategy is the server-side OAuth integration.

It uses:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

Its job is:

- redirecting the browser to Google from `/auth/google`
- receiving the callback from Google at `/auth/google/callback`
- extracting the Google profile
- passing that profile into `AuthService`

### 5.5 JWT Auth Guard

`JwtAuthGuard` protects backend routes by:

- reading the `Authorization` header
- requiring a `Bearer` token
- verifying the token using `JWT_SECRET`
- attaching `userId` and `userEmail` to the request

This is the main route-protection mechanism for authenticated APIs.

## 6. Access Token Design

The access token is a JWT with:

- subject: internal `user.id`
- email: current user email
- secret: `JWT_SECRET`
- expiry: `JWT_ACCESS_EXPIRY`

Current intended lifetime:

- `15m`

The access token is:

- returned by `POST /auth/login`
- returned by `POST /auth/register`
- returned by `POST /auth/refresh`
- not written to cookies by the backend
- not stored in localStorage or sessionStorage by the frontend
- kept only in frontend memory

This reduces long-lived browser persistence risk.

## 7. Refresh Token Design

The refresh token is also a JWT, but it is treated differently from the access token.

It uses:

- secret: `JWT_REFRESH_SECRET`
- expiry: `JWT_REFRESH_EXPIRY`

Current intended lifetime:

- `7d`

The refresh token is:

- issued by the backend on successful login/registration/Google callback
- sent to the browser as a cookie named `refreshToken`
- stored as `HttpOnly`
- stored with a bcrypt hash in `User.refreshTokenHash`
- rotated on every successful refresh

The raw refresh token is never stored in the database.

## 8. Refresh Cookie Behavior

The refresh token cookie uses:

- name: `refreshToken`
- path: `/auth`
- `HttpOnly: true`

Environment-specific behavior:

### 8.1 Local Development

- `secure: false`
- `sameSite: lax`

This allows local HTTP development without HTTPS.

### 8.2 Production

- `secure: true`
- `sameSite: none`

This is required for secure cross-site deployments where frontend and backend may be hosted on different origins.

## 9. Email/Password Login Flow

### 9.1 Registration

Endpoint:

- `POST /auth/register`

Request body:

- `email`
- `password`

Backend behavior:

1. checks whether the email is already registered
2. hashes the password with bcrypt using `BCRYPT_SALT_ROUNDS`
3. creates the user in PostgreSQL
4. issues access token and refresh token
5. hashes the refresh token
6. stores the hash in `User.refreshTokenHash`
7. sets the refresh-token cookie
8. returns:
   - `accessToken`
   - `accessTokenExpiresIn`
   - `user`

### 9.2 Login

Endpoint:

- `POST /auth/login`

Request body:

- `email`
- `password`

Backend behavior:

1. loads the user by email
2. verifies the stored `passwordHash`
3. issues a fresh access token and refresh token
4. hashes and stores the new refresh token
5. sets the refresh-token cookie
6. returns:
   - `accessToken`
   - `accessTokenExpiresIn`
   - `user`

## 10. Server-Side Google OAuth Flow

This is the corrected implementation replacing the previous client-side Google access-token exchange.

### 10.1 Entrypoint

Endpoint:

- `GET /auth/google`

Frontend behavior:

- the login or register page redirects the browser to the backend endpoint
- the frontend includes a `returnTo` query parameter
  - `/login`
  - `/register`

Backend behavior:

- `GoogleAuthGuard` starts the Passport Google OAuth flow
- the guard sends a `state` parameter to Google
- the `state` value is the sanitized frontend return path

Security behavior:

- only relative return paths are accepted
- values like `https://evil.example` are rejected
- invalid values fall back to `/login`

### 10.2 Redirect to Google

The backend redirects the browser to Google’s OAuth consent page.

The redirect includes:

- `client_id` from `GOOGLE_CLIENT_ID`
- `redirect_uri` from `GOOGLE_CALLBACK_URL`
- requested scopes:
  - `email`
  - `profile`
- `state` equal to the sanitized frontend return path

### 10.3 Callback

Endpoint:

- `GET /auth/google/callback`

Google redirects the browser back here after user consent.

Backend behavior:

1. Passport exchanges the authorization code with Google using:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_CALLBACK_URL`
2. the Google profile is extracted
3. the strategy passes the profile into `AuthService.loginWithGoogleProfile()`
4. the service:
   - finds user by `googleId` or email
   - creates a user if none exists
   - links `googleId` to an existing email account when appropriate
5. the backend issues:
   - access token
   - refresh token
6. the backend stores the hashed refresh token
7. the backend sets the refresh-token cookie
8. the backend redirects the browser to:
   - `${FRONTEND_URL}${returnTo}?auth=success`

### 10.4 OAuth Failure Path

If Google OAuth fails during callback:

- the guard redirects the browser back to the frontend
- frontend redirect target becomes:
  - `${FRONTEND_URL}${returnTo}?auth=error`

This lets the frontend display an auth failure state without exposing token details.

## 11. Frontend Auth State Design

Frontend auth logic lives mainly in:

- `frontend/lib/api.ts`
- `frontend/lib/auth-context.tsx`
- `frontend/app/login/page.tsx`
- `frontend/app/register/page.tsx`

### 11.1 In-Memory Access Token

The frontend keeps the access token in a module-level variable inside `frontend/lib/api.ts`.

This means:

- the access token survives client-side navigation
- the access token does not survive a full page reload by itself
- after a reload, the frontend recovers auth state by calling `/auth/refresh` with the cookie

### 11.2 No Persistent Browser Storage

The frontend does not store the access token in:

- localStorage
- sessionStorage
- cookies

This is intentional.

### 11.3 Auth Context Bootstrapping

`AuthProvider` is responsible for recovering the current session.

On startup:

1. if no in-memory access token exists, it calls `refreshAccessToken()`
2. `refreshAccessToken()` calls `POST /auth/refresh` with `credentials: 'include'`
3. if refresh succeeds, the returned access token is stored in memory
4. the frontend then calls `GET /auth/me`
5. the user object is stored in context state

If any of that fails:

- in-memory access token is cleared
- current user becomes `null`

## 12. Frontend Google Login Handling

The frontend no longer performs Google OAuth directly with `useGoogleLogin()`.

Current behavior:

### 12.1 User Clicks “Login With Google”

Login page:

- browser navigates to:
  - `${NEXT_PUBLIC_API_URL}/auth/google?returnTo=/login`

Register page:

- browser navigates to:
  - `${NEXT_PUBLIC_API_URL}/auth/google?returnTo=/register`

### 12.2 Browser Returns from Backend

After successful Google auth:

- browser lands back on the frontend with:
  - `?auth=success`

The login/register page then:

1. calls `refreshAccessToken()`
2. receives a new access token from `POST /auth/refresh`
3. logs:
   - `Testing authToken: <token>`
4. updates auth context
5. redirects to `/cards`

If the callback fails:

- browser lands with `?auth=error`
- the page shows a Google sign-in error

## 13. Refresh Flow

Endpoint:

- `POST /auth/refresh`

Expected request:

- no request body required
- frontend must include credentials so the refresh-token cookie is sent

Backend behavior:

1. reads `refreshToken` cookie
2. verifies the token using `JWT_REFRESH_SECRET`
3. loads the user by token subject
4. checks that `User.refreshTokenHash` exists
5. bcrypt-compares the cookie token against the stored hash
6. if valid:
   - issues new access token
   - issues new refresh token
   - hashes and stores the new refresh token
   - replaces the refresh-token cookie
7. returns only:
   - `accessToken`
   - `accessTokenExpiresIn`

Important security property:

- refresh tokens are rotated on every successful refresh

If refresh fails:

- backend clears the refresh-token cookie
- returns `401`

## 14. Protected Route Authentication

Protected backend routes rely on `JwtAuthGuard`.

Examples include:

- `GET /auth/me`
- card routes
- billing routes

Expected request format:

- `Authorization: Bearer <accessToken>`

Backend validation steps:

1. ensure `Authorization` header exists
2. ensure header starts with `Bearer `
3. verify JWT using `JWT_SECRET`
4. attach user identity to the request

The refresh cookie is not used for normal protected-page navigation. It is only used to obtain new access tokens.

## 15. Logout Flow

Endpoint:

- `POST /auth/logout`

Frontend behavior:

- sends the in-memory bearer access token when available
- includes credentials so the refresh cookie is also sent

Backend behavior:

1. reads refresh token from cookie if present
2. reads access token from bearer header if present
3. attempts to determine the user id from either token
4. clears `User.refreshTokenHash`
5. clears the refresh-token cookie

Security outcome:

- the browser loses the refresh cookie
- the database loses the valid refresh-token hash
- future refresh requests fail with `401`
- any old in-memory access token will expire naturally according to `JWT_ACCESS_EXPIRY`

## 16. CORS and Credential Requirements

The backend CORS configuration uses:

- origin:
  - `FRONTEND_URL`
- credentials:
  - `true`

This is required because the frontend must be allowed to send the refresh-token cookie to:

- `POST /auth/refresh`
- `POST /auth/logout`

Frontend fetch behavior uses:

- `credentials: 'include'`

This is mandatory for refresh-cookie transport.

## 17. Security Properties Achieved

The current implementation provides the following security improvements over the old flow:

### 17.1 Access Token Is No Longer a Long-Lived Cookie

Old problem:

- access token was effectively acting as a long-lived session cookie
- expiry was hardcoded to 30 days

Current behavior:

- access token is short-lived
- current value is `15m`
- access token is bearer-only and in memory only

### 17.2 Refresh Token Is Protected from Frontend JavaScript

Current behavior:

- refresh token is in an `HttpOnly` cookie
- frontend code cannot read it directly

### 17.3 Refresh Token Persistence Is Hashed

Current behavior:

- only bcrypt hash is stored in PostgreSQL
- raw refresh token is not stored server-side

### 17.4 Route Access Is Explicitly Bearer-Based

Current behavior:

- protected APIs require bearer access token
- refresh cookie alone is not enough for normal authenticated API usage

### 17.5 Google OAuth Is Now Server-Driven

Current behavior:

- Google client secret is used by the backend
- Google callback URL is used by the backend
- browser is redirected through backend-owned OAuth endpoints

This is materially better aligned with the intended security model than the previous client-side Google access-token exchange.

## 18. Validation Performed

The implementation was rechecked locally with the configured environment.

Validated successfully:

- backend build
- frontend build
- register flow
- access-token issuance with `15m` lifetime
- refresh-token issuance with `7d` lifetime
- refresh-token cookie creation
- refresh-token hash persistence
- `GET /auth/me` with bearer token
- refresh-token rotation
- logout revocation
- refresh failing after logout
- `/auth/google` redirect generation
- Google redirect using configured:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CALLBACK_URL`
- `returnTo` sanitization for Google state

Automated local validation limitation:

- the full Google consent-and-callback round trip with a real user account was not fully automated in the CLI environment
- however, the server-side redirect configuration, callback wiring, env usage, and backend strategy setup were validated

## 19. Remaining Operational Assumptions

The security implementation assumes:

- the Google OAuth app in Google Cloud is configured with the same callback URL as `GOOGLE_CALLBACK_URL`
- the frontend origin matches `FRONTEND_URL`
- production deployments use HTTPS
- production deployments keep `secure=true` on refresh cookies
- secrets are protected outside the repository

## 20. Practical End-to-End Behavior

From a user perspective, the final behavior is:

### Email/Password

1. user logs in or registers
2. backend sets refresh cookie
3. backend returns access token
4. frontend keeps access token in memory
5. protected API requests use bearer token
6. when token expires, frontend refreshes using cookie

### Google OAuth

1. user clicks `Login With Google`
2. frontend navigates to backend `/auth/google`
3. backend redirects to Google
4. Google returns to backend `/auth/google/callback`
5. backend links or creates the user
6. backend sets refresh cookie
7. backend redirects to frontend with `?auth=success`
8. frontend calls `/auth/refresh`
9. frontend stores returned access token in memory
10. frontend loads the authenticated user and redirects into the app

This is the implemented security model currently in the repository.
