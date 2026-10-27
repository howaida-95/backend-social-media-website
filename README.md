# PingUp Backend

Backend API for **PingUp**, a social networking application built with Node.js, Express, TypeScript, MySQL, and Sequelize.

The project is being developed as a learning and practice project while following a production-oriented backend architecture.

---

## 📌 Project Overview

PingUp is a social media platform where users can:

- Create accounts and sign in
- Manage their profiles
- Create posts
- Upload images
- Like and comment on posts
- Follow other users
- Manage connection requests
- Create and view stories
- Discover and search for users
- Send messages
- Receive notifications
- Communicate in real time

The backend provides the REST API and real-time communication required by the frontend application.

---

## 🛠️ Technology Stack

### Core

- **Node.js** — JavaScript runtime
- **TypeScript** — Static typing
- **Express.js** — HTTP server and REST API framework

### Database

- **MySQL** — Relational database
- **Sequelize** — ORM

### Authentication & Security

- **JWT** — Authentication
- **bcrypt** — Password hashing
- **Zod** — Request validation
- **Helmet** — Security headers
- **CORS** — Cross-origin request handling
- **express-rate-limit** — Rate limiting

### File & Media

- **Multer** — File upload handling
- **Cloudinary** — Image/media storage

### Real-time Communication

- **Socket.IO** — Real-time messaging and events

### Development & Quality

- **tsx / Nodemon** — Development server
- **ESLint** — Code linting
- **Prettier** — Code formatting
- **Jest** — Testing
- **Supertest** — API testing
- **Husky** — Git hooks
- **lint-staged** — Pre-commit checks

---

## 📁 Project Architecture

The project follows a **feature-based modular architecture**.

```text
pingup-backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   └── cloudinary.ts
│   │
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   ├── users/
│   │   ├── posts/
│   │   ├── comments/
│   │   ├── likes/
│   │   ├── connections/
│   │   ├── stories/
│   │   ├── messages/
│   │   └── notifications/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── rate-limit.middleware.ts
│   │
│   ├── routes/
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── pagination.ts
│   │   └── response.ts
│   │
│   ├── types/
│   │   ├── express.d.ts
│   │   └── common.types.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── tests/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

### Module Structure

Each feature is isolated inside its own module.

Example:

```text
modules/
└── users/
    ├── user.model.ts
    ├── user.controller.ts
    ├── user.service.ts
    ├── user.repository.ts
    ├── user.routes.ts
    ├── user.validation.ts
    └── user.types.ts
```

### Responsibilities

| Layer | Responsibility |
|---|---|
| Routes | Define API endpoints |
| Controller | Handle HTTP request/response |
| Service | Business logic |
| Repository | Database operations |
| Model | Database structure |
| Validation | Validate incoming data |
| Middleware | Cross-cutting request processing |

---

## 🔄 Request Flow

The main request flow is:

```text
Client
  ↓
Express
  ↓
Middleware
  ↓
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Sequelize
  ↓
MySQL
```

For example:

```text
POST /api/v1/posts
        ↓
Authentication
        ↓
Validation
        ↓
Post Controller
        ↓
Post Service
        ↓
Post Repository
        ↓
MySQL
        ↓
Response
```

---

## 🔐 Authentication Flow

The authentication system will use JWT.

```text
Register
   ↓
Validate input
   ↓
Hash password
   ↓
Create user
```

Login:

```text
Login
   ↓
Validate credentials
   ↓
Verify password
   ↓
Generate JWT
   ↓
Return authentication information
```

Protected request:

```text
Client
   ↓
JWT
   ↓
Authentication Middleware
   ↓
Verify token
   ↓
Attach authenticated user
   ↓
Controller
```

---

## 🗄️ Database

The application uses MySQL with Sequelize.

Expected main entities include:

```text
Users
Posts
Comments
Likes
Connections
Stories
Conversations
Messages
Notifications
```

Relationships will include:

```text
User 1 ─────── * Posts

User 1 ─────── * Stories

Post 1 ─────── * Comments

Post * ─────── * Users
       (Likes)

User * ─────── * Users
       (Followers / Following)

User * ─────── * Users
       (Connections)

Conversation 1 ─────── * Messages
```

Database migrations and seeders will be used to manage database changes and development data.

---

## 🌐 API Structure

The API is versioned:

```text
/api/v1
```

Main resources:

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
```

Example endpoints:

### Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
```

### Users

```http
GET   /api/v1/users/:id
PATCH /api/v1/users/me
```

### Posts

```http
GET    /api/v1/posts
POST   /api/v1/posts
GET    /api/v1/posts/:id
DELETE /api/v1/posts/:id
```

### Social interactions

```http
POST   /api/v1/posts/:id/likes
DELETE /api/v1/posts/:id/likes

POST   /api/v1/users/:id/follow
DELETE /api/v1/users/:id/follow
```

These endpoints are part of the planned API and may change as the project evolves.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root.

Example:

```env
NODE_ENV=development
PORT=5000
BACKEND_PUBLIC_URL=http://localhost:5000

DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=pingup
DATABASE_USER=root
DATABASE_PASSWORD=

JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit `.env` to Git.

Use `.env.example` to document required environment variables without exposing secrets.
In production, set `BACKEND_PUBLIC_URL` to the public backend origin (for example,
`https://api.example.com`) so uploaded-file URLs point to the deployed server.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd pingup-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env
```

based on:

```text
.env.example
```

### 4. Create the database

Create a MySQL database named:

```text
pingup
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Seed development data

```bash
npm run db:seed
```

### 7. Start the development server

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

---

## 📜 Available Scripts

The exact scripts will be added as the project is configured.

Planned scripts:

```bash
npm run dev
npm run build
npm run start

npm run lint
npm run format
npm run test
npm run test:watch

npm run db:migrate
npm run db:migrate:undo
npm run db:seed
```

---

## 🧪 Testing

The backend will use:

- Jest
- Supertest

Testing layers will include:

```text
Unit Tests
    ↓
Service / Utility Tests

Integration Tests
    ↓
API + Database

End-to-End Tests
    ↓
Complete User Flows
```

Important flows to test:

- Registration
- Login
- Authentication
- Profile updates
- Creating posts
- Likes
- Comments
- Follow requests
- Connections
- Stories
- Messaging

---

## 🛡️ Error Handling

The API will use centralized error handling.

Expected HTTP status codes include:

| Status | Meaning |
|---|---|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

The goal is to provide a consistent API error response instead of handling errors differently in every controller.

---

## 📤 File Upload Architecture

Images will not be stored directly inside MySQL.

The planned flow is:

```text
Frontend
   ↓
Express
   ↓
Multer
   ↓
Cloudinary
   ↓
Image URL
   ↓
MySQL
```

Supported media will include:

- Profile pictures
- Cover photos
- Post images
- Story images
- Message images

---

## 💬 Real-Time Messaging

Messaging will use Socket.IO for real-time communication.

```text
User A
   │
   │ WebSocket
   ↓
Socket.IO
   ↓
Backend
   ↓
Socket.IO
   │
   ↓
User B
```

Messages will also be persisted in MySQL so users can retrieve their message history.

Planned real-time features:

- Sending messages
- Receiving messages
- Online status
- Typing indicator
- Read status

---

## 🔒 Security

The backend will include:

- Password hashing
- JWT authentication
- Input validation
- CORS configuration
- HTTP security headers
- Rate limiting
- Secure environment variables
- Authorization checks
- File upload validation
- Consistent error handling

Sensitive information must never be committed to the repository.

---

## 🗺️ Development Roadmap

### Phase 1 — Project Foundation

- [ ] Initialize Node.js project
- [ ] Configure TypeScript
- [ ] Configure Express
- [ ] Configure environment variables
- [ ] Create project architecture
- [ ] Add basic error handling

### Phase 2 — Database

- [ ] Install MySQL
- [ ] Configure Sequelize
- [ ] Create database
- [ ] Design entities
- [ ] Create migrations
- [ ] Create seeders
- [ ] Define relationships

### Phase 3 — Authentication

- [ ] Registration
- [ ] Login
- [ ] Password hashing
- [ ] JWT
- [ ] Authentication middleware
- [ ] Authorization
- [ ] Logout

### Phase 4 — Users

- [ ] Get profile
- [ ] Update profile
- [ ] Profile picture
- [ ] Cover photo
- [ ] Search users

### Phase 5 — Posts

- [ ] Create post
- [ ] Get feed
- [ ] Get post
- [ ] Delete post
- [ ] Pagination
- [ ] Image uploads

### Phase 6 — Social Features

- [ ] Likes
- [ ] Comments
- [ ] Follow / unfollow
- [ ] Connection requests
- [ ] Accept / reject requests
- [ ] Followers / following

### Phase 7 — Stories

- [ ] Create story
- [ ] Upload story media
- [ ] View stories
- [ ] Story expiration

### Phase 8 — Messaging

- [ ] Conversations
- [ ] Messages
- [ ] Message history
- [ ] Image messages
- [ ] Socket.IO
- [ ] Online status
- [ ] Typing indicator
- [ ] Read status

### Phase 9 — Notifications

- [ ] Follow notifications
- [ ] Like notifications
- [ ] Comment notifications
- [ ] Connection notifications
- [ ] Message notifications

### Phase 10 — Quality & Production

- [ ] Validation
- [ ] Error handling
- [ ] Security
- [ ] Logging
- [ ] Testing
- [ ] API documentation
- [ ] Performance optimization
- [ ] Docker
- [ ] CI/CD
- [ ] Sentry
- [ ] Deployment

---

## 🎯 Project Goals

This project is intended to demonstrate practical backend development skills, including:

- REST API design
- Node.js and Express architecture
- TypeScript
- Relational database design
- Sequelize ORM
- Authentication and authorization
- API validation
- File uploads
- Real-time communication
- Error handling
- Security
- Testing
- API documentation
- Production-oriented architecture

---

## 📚 Learning Approach

The backend will be developed incrementally.

For each feature, the implementation process follows:

```text
UI Requirement
      ↓
API Requirement
      ↓
Database Requirement
      ↓
Route
      ↓
Validation
      ↓
Controller
      ↓
Service
      ↓
Repository
      ↓
Database
      ↓
Testing
```

The goal is not only to make the application work, but to understand **why each backend layer exists and how the pieces work together**.

---

## 👩‍💻 Project Status

**Status:** 🚧 In Development

This project is being built incrementally, starting with the backend foundation and progressing toward a complete social networking API.
