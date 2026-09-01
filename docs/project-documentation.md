# PingUp Backend — Project Documentation

Documentation for the **PingUp** social media backend API.

Related files:

- [`README.md`](../README.md) — setup and overview
- [`database-design.md`](./database-design.md) — entities and relationships
- [`steps.md`](./steps.md) — implementation checklist
- [`project.md`](../project.md) — planning notes

---

## 1. Product Overview 

**PingUp** is a social networking app where users can connect, share posts and stories, message each other, and discover people.

| Frontend area | What users do | Backend responsibility |
|---|---|---|
| Sign in / Sign up | Email + password auth | Auth module (JWT, bcrypt) |
| Feed | View posts, stories, like/comment | Posts, Stories, Likes, Comments |
| Create Post | Text + optional image | Posts + Uploads |
| Create Story | Text (colors) or media, 24h expiry | Stories + StoryViews |
| Profile | View/edit profile, posts, media, likes | Users + Posts + Likes |
| Connections | Followers, following, pending, connections | Connections |
| Discover | Search people by name, username, bio, location | Users search |
| Messages | Chat with text and images | Messages + Socket.IO |
| Notifications | Likes, follows, messages, etc. | Notifications |

---

## 2. Technology Stack

### Core

| Purpose | Technology |
|---|---|
| Runtime | Node.js (v22+) |
| Language | TypeScript |
| HTTP framework | Express.js 5 |
| Module system | ESM (`"type": "module"`) |

### Database

| Purpose | Technology |
|---|---|
| Database | MySQL |
| ORM | Sequelize 6 |
| Schema changes | Sequelize migrations (`sequelize-cli`) |
| Driver | mysql2 |

### Security & Auth

| Purpose | Technology |
|---|---|
| Authentication | JWT (`jsonwebtoken`) |
| Password hashing | bcrypt |
| Validation | Zod |
| Security headers | Helmet |
| CORS | cors |
| Rate limiting | express-rate-limit |

### Media & Real-time

| Purpose | Technology |
|---|---|
| Multipart uploads | Multer |
| Image hosting | Cloudinary (planned) |
| Real-time messaging | Socket.IO |

### Tooling

| Purpose | Technology |
|---|---|
| Dev server | Nodemon + tsx |
| Env config | dotenv |
| Logging | Morgan |
| Lint / format | ESLint, Prettier |
| Git hooks | Husky, lint-staged |
| API testing | Postman / Thunder Client |
| Unit / API tests | Jest + Supertest (planned) |

---

## 3. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│   Feed · Profile · Connections · Discover · Messages    │
└──────────────────────────┬──────────────────────────────┘
                           │ REST + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Express API (server.ts)                │
│  Helmet · CORS · Rate limit · Auth · Validation · Errors │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   Feature modules    Socket.IO          Uploads
   (routes → ctrl →   (messages /       (Multer →
    service → repo)    notifications)    Cloudinary)
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Sequelize models + associations             │
└──────────────────────────┬──────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│                         MySQL                            │
│  users · posts · comments · likes · connections ·        │
│  stories · story_views · messages · notifications        │
└─────────────────────────────────────────────────────────┘
```

### Layered request flow

```text
Client
  → Express middleware (auth, validate, rate-limit)
  → Route
  → Controller   (HTTP in / out)
  → Service      (business rules)
  → Repository   (queries)
  → Sequelize Model
  → MySQL
  → JSON response
```

---

## 4. Folder Structure

```text
backend/
├── docs/
│   ├── project-documentation.md   ← this file
│   ├── database-design.md
│   └── steps.md
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── database/
│   │   ├── models.ts              # all associations
│   │   ├── migrations/
│   │   └── config/database.cjs    # sequelize-cli config
│   ├── modules/
│   │   ├── users/
│   │   ├── posts/
│   │   ├── comments/
│   │   ├── likes/
│   │   ├── connections/
│   │   ├── stories/
│   │   ├── messages/
│   │   ├── notifications/
│   │   └── uploads/               # planned
│   ├── middlewares/               # planned / expanding
│   ├── routes/
│   ├── utils/
│   ├── types/
│   ├── app.ts                     # Express app
│   └── server.ts                  # boot + DB connect
├── package.json
├── tsconfig.json
├── nodemon.json
└── .env
```

### Module pattern (per feature)

```text
modules/<feature>/
├── <feature>.model.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.repository.ts
├── <feature>.routes.ts
├── <feature>.validation.ts
└── <feature>.types.ts
```

| Layer | Responsibility |
|---|---|
| Model | Table shape, validations, indexes |
| Repository | Sequelize queries only |
| Service | Business logic, rules, orchestration |
| Controller | Parse request, call service, send response |
| Routes | Wire URL → middleware → controller |
| Validation | Zod schemas for body/params/query |

Associations live in **one place**: `src/database/models.ts`.

---

## 5. Domain Modules (mapped to UI)

### 5.1 Authentication

**UI:** Sign in / Sign up landing page.

| Concern | Detail |
|---|---|
| Register | Validate → hash password → create user |
| Login | Verify credentials → issue JWT |
| Logout | Client discards token (optional blacklist later) |
| Protected routes | `Authorization: Bearer <token>` |

### 5.2 Users / Profile

**UI:** Profile page, Edit Profile modal, Discover cards.

| Field (UI) | Backend |
|---|---|
| Name | `firstName` + `lastName` |
| Username | `username` (unique) |
| Email | `email` (unique) |
| Bio | `bio` |
| Profile picture | `avatar` (URL) |
| Cover photo | extend model / uploads (planned) |
| Location | extend model (planned) |
| Joined date | `createdAt` |
| Role | `user` \| `admin` |

Profile tabs:

- **Posts** → user’s posts
- **Media** → posts with `imageUrl`
- **Likes** → posts liked by user

### 5.3 Posts & Feed

**UI:** Feed, Create Post (“What’s happening?”).

| Field | Type |
|---|---|
| `userId` | FK → users |
| `content` | text (optional) |
| `imageUrl` | media URL (optional) |

Engagement (UI counters):

- Likes → `likes` table
- Comments → `comments` table
- Share count → optional later

Feed typically loads posts from followed users, newest first, with pagination.

### 5.4 Comments & Likes

**UI:** Heart and comment icons on posts.

- One user can like a post once (unique `(userId, postId)`).
- Comments belong to one user and one post.

### 5.5 Connections (social graph)

**UI:** Connections dashboard — Followers, Following, Pending, Connections.

Self-referencing many-to-many via `connections`:

```text
User A follows User B
  followerId  = A
  followingId = B
```

Sequelize aliases (must be unique):

| Alias | Meaning |
|---|---|
| `following` | users I follow |
| `followers` | users who follow me |
| `follower` / `following` on `Connection` | junction-table access |

UI counters:

| Counter | Query idea |
|---|---|
| Followers | count where `followingId = me` |
| Following | count where `followerId = me` |
| Pending | connection requests with status `pending` (if status column is added) |
| Connections | mutual follows (or accepted friendships) |

> Current model stores follower/following pairs. Pending/accepted friendship may need a `status` column (`pending` \| `accepted`) if the UI treats connections as request-based.

### 5.6 Discover

**UI:** Search by name, username, bio, location + Follow buttons.

Backend needs search endpoints that filter users (and exclude self / already followed where needed).

### 5.7 Stories

**UI:** Story strip + Create Story (text colors or photo/video).

| Field | Purpose |
|---|---|
| `type` | `text` \| `image` \| `video` |
| `content` | text body |
| `mediaUrl` | image/video URL |
| `backgroundColor` | hex for text stories |
| `expiresAt` | usually createdAt + 24h |
| `viewsCount` | denormalized view count |

`story_views` junction: which users viewed which story.

### 5.8 Messages

**UI:** Messages page + Recent Messages sidebar.

| Field | Purpose |
|---|---|
| `senderId` / `receiverId` | participants |
| `text` | message body |
| `imageUrl` | optional attachment |
| `isRead` | read receipt |

Real-time delivery via **Socket.IO**; persistence via REST + MySQL.

### 5.9 Notifications

**UI:** System feedback for social actions.

Types in model:

`like` · `comment` · `follow_request` · `follow_accept` · `message` · `mention` · `profile_view`

Optional FKs: `postId`, `messageId`.

---

## 6. Database Entities

```text
users
posts
comments
likes
connections
stories
story_views
messages
notifications
```

### Main relationships

```text
User 1 ─── * Post
User 1 ─── * Comment
User 1 ─── * Like
Post 1 ─── * Comment
Post 1 ─── * Like

User * ─── * User          (connections: followers / following)
User 1 ─── * Story
Story * ─── * User         (story_views)
User 1 ─── * Message       (as sender / receiver)
User 1 ─── * Notification  (as recipient / sender)
Post 1 ─── * Notification
Message 1 ── * Notification
```

### Important constraints

- Unique `email`, `username`
- Unique like per `(userId, postId)`
- Unique connection per `(followerId, followingId)`
- User cannot follow themselves (enforce in service)
- Soft deletes on users/posts where `paranoid: true`

See [`database-design.md`](./database-design.md) for indexes and denormalization notes.

---

## 7. API Design

Base path:

```text
/api/v1
```

Health check:

```http
GET /api/health
```

### Planned resources

```text
/api/v1/auth
/api/v1/users
/api/v1/posts
/api/v1/comments
/api/v1/likes
/api/v1/connections
/api/v1/stories
/api/v1/messages
/api/v1/notifications
/api/v1/uploads
```

### Example endpoints (aligned with UI)

```http
# Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout

# Profile
GET    /api/v1/users/:username
PATCH  /api/v1/users/me
GET    /api/v1/users/:id/posts
GET    /api/v1/users/discover?q=

# Posts / Feed
GET    /api/v1/posts
POST   /api/v1/posts
GET    /api/v1/posts/:id
DELETE /api/v1/posts/:id
POST   /api/v1/posts/:id/likes
DELETE /api/v1/posts/:id/likes
POST   /api/v1/posts/:id/comments

# Connections
GET    /api/v1/connections/followers
GET    /api/v1/connections/following
POST   /api/v1/users/:id/follow
DELETE /api/v1/users/:id/follow

# Stories
GET    /api/v1/stories
POST   /api/v1/stories
POST   /api/v1/stories/:id/view

# Messages
GET    /api/v1/messages/conversations
GET    /api/v1/messages/:userId
POST   /api/v1/messages

# Notifications
GET    /api/v1/notifications
PATCH  /api/v1/notifications/:id/read
```

### Response shape (convention)

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

Errors:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": []
}
```

---

## 8. Security

| Practice | Implementation |
|---|---|
| Password storage | bcrypt (12+ rounds) |
| Auth | JWT with expiry |
| Input validation | Zod on every write endpoint |
| Headers | Helmet |
| CORS | Allow frontend origin only |
| Rate limits | Auth and sensitive routes |
| Secrets | `.env` only — never commit |
| SQL injection | Sequelize parameterized queries |
| Soft delete | Prefer deactivate over hard delete for users |

---

## 9. Environment Variables

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=pingup
DATABASE_USER=root
DATABASE_PASSWORD=

JWT_SECRET=change_me
JWT_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 10. Development Workflow

```bash
npm install
npm run db:migrate
npm run db:seed          # when seeders exist
npm run dev              # nodemon + tsx → src/server.ts
```

Useful scripts:

| Script | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run db:migrate` | Apply migrations |
| `npm run db:undo` | Undo last migration |
| `npm run db:seed` | Seed data |
| `npm run db:reset` | Undo then migrate |

**Per-feature DB workflow** (from `steps.md`):

1. Model  
2. Migration  
3. Update associations in `models.ts`  
4. Run migration  
5. Repository → Service → Controller → Routes → Validation  

---

## 11. Implementation Status (high level)

| Area | Status |
|---|---|
| Project bootstrap (Express, TS, env, DB) | Done |
| User model + module skeleton | In progress |
| Post / Comment / Like models + migrations | Done |
| Connections model + associations | Done |
| Stories + StoryViews | Done |
| Messages + Notifications models | Done |
| Auth (JWT register/login) | Pending |
| Full controllers / routes for all modules | Pending |
| Uploads (Multer + Cloudinary) | Pending |
| Socket.IO messaging | Pending |
| Discover search | Pending |
| Tests | Pending |

Track finer-grained progress in [`steps.md`](./steps.md).

---

## 12. Design Principles

1. **Feature modules** — keep domain code together.
2. **Thin controllers** — business logic stays in services.
3. **Single association file** — avoid duplicate Sequelize aliases.
4. **Migrations first** — schema changes go through migrations.
5. **Validate at the edge** — Zod before business logic.
6. **Consistent API** — versioned `/api/v1`, uniform JSON envelope.
7. **Security by default** — hash passwords, protect routes, rate-limit auth.

---

## 13. Quick Reference — UI → Backend

| Screen | Primary modules |
|---|---|
| Landing / Sign in | `auth`, `users` |
| Feed | `posts`, `stories`, `likes`, `comments` |
| Create Post | `posts`, `uploads` |
| Create Story | `stories`, `uploads` |
| Profile / Edit Profile | `users`, `posts`, `likes` |
| Connections | `connections` |
| Discover People | `users`, `connections` |
| Messages | `messages` (+ Socket.IO) |
| Activity feedback | `notifications` |

---

*Last updated to match the PingUp UI and the current backend layout under `backend/src`.*
