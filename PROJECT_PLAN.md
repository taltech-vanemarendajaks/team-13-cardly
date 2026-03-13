# Cardly - Project Plan

## Overview

A dynamic web application for creating and managing interactive greeting cards. Users can add media content (images, audio), customized texts, and animations. Cards can be password-protected and shared via links, QR codes, or embeddable iframes.

**Platform:** Desktop + mobile-responsive web (no native apps)

## Features

### Core Features
- **Google OAuth login** — single sign-on, no email/password registration
- **Card editor** — drag/drop interface for building cards with text, images, audio, and animations
- **Default templates** — pre-built themes (birthday, Christmas, New Year, Valentine's Day, etc.)
- **Custom image upload** — users can upload their own images or use provided ones
- **Audio support** — add background music to cards
- **Card management dashboard** — view, edit, delete existing cards
- **Password protection** — optionally lock a card behind a password
- **Card sharing** — shareable link for each card
- **QR code generation** — generates a QR code that opens the card
- **Iframe embed** — one-click code snippet to embed a card on any website

### Stretch Goal
- **Card scheduling** — set a future date/time; visitors see a countdown until the card reveals itself

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | Next.js 15 + TypeScript | React-based, SSR for shared card SEO, App Router |
| UI | Tailwind CSS + shadcn/ui | Fast development with polished, accessible components |
| Backend | NestJS + TypeScript | Structured, modular Node.js framework |
| ORM | Prisma | Type-safe database access, easy migrations |
| Database | PostgreSQL | Reliable relational DB, JSON support for card content |
| Auth | Google OAuth 2.0 + JWT | Simple for users, no password management overhead |
| File Storage | Cloudflare R2 or AWS S3 | TBD — R2 has no egress fees, S3 has broader ecosystem |
| Containers | Docker Compose | Local development with PostgreSQL |
| Hosting | TBD | Options: Render (free tier), Railway ($5/mo), Fly.io (free tier) |

### Hosting Options Comparison

| Platform | Cost | Pros | Cons |
|----------|------|------|------|
| Render | Free | Zero cost, easy deploy | Backend sleeps after 15min inactivity (slow cold starts) |
| Railway | $5/mo | Best DX, always-on | No free tier |
| Fly.io | Free | 3 free shared VMs, global edge | More complex setup |

**Recommendation:** Start with Render free tier for development/demo. Move to Railway for production if needed.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js    │────▶│   NestJS    │────▶│ PostgreSQL  │
│  Frontend    │     │   Backend   │     │  Database   │
│  (port 3000) │     │  (port 3001)│     │ (port 5432) │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  S3 / R2    │
                    │ File Storage│
                    └─────────────┘
```

- **Frontend** serves the UI, handles routing, renders shared cards with SSR for SEO/Open Graph
- **Backend** exposes a REST API, handles auth, card CRUD, media uploads
- **Database** stores users, cards (content as JSON), and media references
- **File Storage** hosts uploaded images and audio files

## Database Schema

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | String | Unique, from Google |
| name | String? | Display name from Google |
| googleId | String | Unique, Google OAuth subject ID |
| avatarUrl | String? | Profile picture from Google |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

### Card
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| title | String | Card name |
| template | String? | Template identifier |
| content | JSON | Card definition (texts, positions, styles, animations) |
| thumbnailUrl | String? | Preview image |
| password | String? | Bcrypt hash, null = no password |
| isPublic | Boolean | Default true |
| scheduledAt | DateTime? | Stretch goal: countdown until this time |
| userId | UUID | FK to User |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |

### Media
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| url | String | S3/R2 URL |
| type | String | "image" or "audio" |
| filename | String | Original filename |
| size | Int | File size in bytes |
| cardId | UUID | FK to Card |
| createdAt | DateTime | Auto-set |

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
| GET | /cards/:id/public | View shared card (checks password/schedule) |
| POST | /cards/:id/verify-password | Verify card password |
| GET | /cards/:id/qr | Generate QR code |
| GET | /cards/:id/embed | Get iframe embed code |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /media/upload | Upload image or audio file |
| DELETE | /media/:id | Delete uploaded file |

## Page Structure

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Landing page | No |
| `/login` | Google sign-in page | No |
| `/dashboard` | User's cards list | Yes |
| `/editor/new` | Create new card | Yes |
| `/editor/:id` | Edit existing card | Yes |
| `/cards/:id` | Public card view (shared link) | No (password if set) |

## Default Templates

Initial set of card templates to ship with:
- Birthday
- Christmas
- New Year
- Valentine's Day
- Thank You
- Blank (custom)

Each template includes: a background image, default text placement, suggested color scheme, and optional animation preset.

## Implementation Phases

### Phase 1: Foundation
- Initialize Next.js frontend with Tailwind + shadcn/ui
- Initialize NestJS backend with Prisma
- Set up Docker Compose for PostgreSQL
- Create database schema and run initial migration
- Basic project configuration (ESLint, TypeScript, etc.)

### Phase 2: Authentication
- Implement Google OAuth flow (backend strategy + callback)
- JWT access + refresh token handling
- Build login page with Google sign-in button
- Auth guard middleware on protected routes
- Token storage and API client with auto-refresh on frontend

### Phase 3: Card CRUD + Dashboard
- Card CRUD endpoints (create, read, update, delete)
- Dashboard page — grid of user's cards with previews
- Card editor page — template selection, text editing, basic layout
- Card preview component

### Phase 4: Sharing & Security
- Public card view page (SSR for SEO/Open Graph meta)
- Password protection (set in editor, verify on public view)
- QR code generation
- Iframe embed code generation
- Share link with copy-to-clipboard

### Phase 5: Media
- S3/R2 integration for file uploads
- Image upload in card editor (own images + provided library)
- Audio upload and playback
- File size/type validation

### Phase 6: Templates & Polish
- Design and implement default card templates
- Card animations (entrance effects, transitions)
- Responsive design polish for mobile
- Error handling and loading states
- SEO and Open Graph meta tags for shared cards

### Stretch: Scheduling
- Add scheduling option in card editor
- Countdown page for scheduled cards
- Auto-reveal after scheduled time

## Open Decisions

| Decision | Options | Notes |
|----------|---------|-------|
| File storage | Cloudflare R2 vs AWS S3 | R2: no egress fees. S3: broader ecosystem. Depends on hosting choice. |
| Hosting | Render vs Railway vs Fly.io | Start free (Render), upgrade if needed |
| Card scheduling | Include or cut | Low effort, but questionable UX value |
