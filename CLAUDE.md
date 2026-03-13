# Cardly - Project Setup Plan

## Overview

A dynamic web application for creating and managing interactive greeting cards. Users can add media content, customized texts, protect cards with passwords, and share them via links, QR codes, or embeddable iframes.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript + Prisma ORM |
| Database | PostgreSQL |
| UI Components | shadcn/ui |
| Auth | Google OAuth 2.0 + JWT (access + refresh tokens) |
| File Storage | Cloudflare R2 or AWS S3 (TBD) |
| Hosting | TBD (Render / Railway / Fly.io) |
| Containers | Docker Compose (local dev) |

## Project Structure

```
cardly/
├── frontend/                        # Next.js 15 (App Router)
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── layout.tsx               # Root layout
│   │   ├── login/
│   │   │   └── page.tsx             # Google sign-in page
│   │   ├── dashboard/
│   │   │   └── page.tsx             # User's cards list
│   │   ├── editor/
│   │   │   ├── new/page.tsx         # Create new card
│   │   │   └── [id]/page.tsx        # Edit existing card
│   │   └── cards/
│   │       └── [id]/page.tsx        # Public card view (shared link)
│   ├── components/
│   │   ├── ui/                      # Reusable UI components (Button, Input, Modal, etc.)
│   │   ├── card/                    # Card-related components (CardPreview, CardEditor, TemplateSelector)
│   │   └── layout/                  # Header, Footer, Sidebar
│   ├── lib/
│   │   ├── api.ts                   # Axios/fetch wrapper for backend API calls
│   │   ├── auth.ts                  # Token storage and refresh logic
│   │   └── utils.ts                 # Shared utility functions
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript interfaces
│   ├── public/
│   │   └── templates/               # Default card template images
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                         # NestJS
│   ├── src/
│   │   ├── main.ts                  # Bootstrap
│   │   ├── app.module.ts            # Root module
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts   # GET /auth/google, /auth/google/callback, POST /auth/refresh
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── google.strategy.ts
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts
│   │   │       └── optional-auth.guard.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts  # GET /users/me, PATCH /users/me
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── cards/
│   │   │   ├── cards.module.ts
│   │   │   ├── cards.controller.ts  # CRUD /cards, GET /cards/:id/public
│   │   │   ├── cards.service.ts
│   │   │   └── dto/
│   │   ├── media/
│   │   │   ├── media.module.ts
│   │   │   ├── media.controller.ts  # POST /media/upload
│   │   │   └── media.service.ts
│   │   └── common/
│   │       ├── filters/             # Exception filters
│   │       └── interceptors/        # Logging, transform interceptors
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── package.json
│
├── docker-compose.yml               # PostgreSQL + backend + frontend
├── .env.example
├── .gitignore
└── README.md
```

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  googleId      String    @unique              // Google OAuth subject ID
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  cards         Card[]
}

model Card {
  id            String    @id @default(uuid())
  title         String
  template      String?                        // template identifier
  content       Json                           // card definition (texts, positions, styles, animations)
  thumbnailUrl  String?
  password      String?                        // bcrypt hash, null = no password
  isPublic      Boolean   @default(true)
  scheduledAt   DateTime?                      // if set, show countdown until this time
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  media         Media[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Media {
  id            String    @id @default(uuid())
  url           String                         // S3/R2 URL
  type          String                         // "image" | "audio"
  filename      String
  size          Int
  cardId        String
  card          Card      @relation(fields: [cardId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
}
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
| PATCH | /users/me | Update profile |

### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /cards | List current user's cards |
| POST | /cards | Create new card |
| GET | /cards/:id | Get card (owner) |
| PATCH | /cards/:id | Update card |
| DELETE | /cards/:id | Delete card |
| GET | /cards/:id/public | View shared card (checks password/schedule) |
| POST | /cards/:id/verify-password | Verify card password |
| GET | /cards/:id/qr | Generate QR code for card |
| GET | /cards/:id/embed | Get iframe embed code |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /media/upload | Upload image or audio file |
| DELETE | /media/:id | Delete uploaded file |

## Docker Compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cardly
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@postgres:5432/cardly
      JWT_SECRET: ${JWT_SECRET}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Environment Variables (.env.example)

```env
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cardly

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# File Storage (S3/R2)
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_REGION=auto

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Implementation Order

### Phase 1: Foundation
1. Initialize monorepo with `frontend/` and `backend/` folders
2. Set up NestJS backend with Prisma + PostgreSQL
3. Set up Next.js frontend with Tailwind CSS
4. Set up Docker Compose for PostgreSQL
5. Create Prisma schema and run initial migration

### Phase 2: Authentication
1. Implement Google OAuth flow (backend strategy + callback)
2. Implement JWT access + refresh token handling
3. Build login page with Google sign-in button
4. Auth guard middleware on protected routes
5. Implement token storage and API client with auto-refresh on frontend

### Phase 3: Card CRUD
1. Implement card CRUD endpoints
2. Build dashboard page (list user's cards)
3. Build card editor page (create/edit)
4. Add default card templates
5. Implement card preview component

### Phase 4: Card Sharing & Security
1. Implement public card view endpoint
2. Build public card view page
3. Add password protection (set + verify)
4. Add scheduling with countdown
5. QR code generation
6. Iframe embed code generation

### Phase 5: Media
1. Set up S3/R2 integration
2. Implement file upload endpoint with validation
3. Build image upload in card editor
4. Add audio upload support
5. Image/audio playback in card view

### Phase 6: Polish
1. Responsive design for mobile
2. Error handling and loading states
3. Card animations
4. SEO and Open Graph meta tags for shared cards
