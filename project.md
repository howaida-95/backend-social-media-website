From your screens, PingUp is essentially a social-media application, so the backend will eventually need:

Authentication
Users/profiles
Posts
Images/media
Stories
Likes
Comments
Followers/following/connections
Search/discover
Messages/chat
Notifications
Profile editing
Authorization
Error handling
Validation
Security
File uploads

The important part is to design the backend before implementing it.

1. First understand the backend we are building

Your frontend has these main areas:

PingUp
│
├── Authentication
│   ├── Sign up
│   ├── Sign in
│   ├── Logout
│   └── Authentication state
│
├── Feed
│   ├── Stories
│   ├── Posts
│   ├── Like
│   ├── Comment
│   └── Share
│
├── Profile
│   ├── View profile
│   ├── Edit profile
│   ├── Profile picture
│   ├── Cover photo
│   └── User posts
│
├── Connections
│   ├── Followers
│   ├── Following
│   ├── Pending requests
│   └── Connections
│
├── Discover
│   ├── Search users
│   ├── Suggested users
│   └── Follow users
│
├── Messages
│   ├── Conversations
│   ├── Send message
│   ├── Images
│   └── Real-time messaging
│
└── Stories
    ├── Create story
    ├── View story
    └── Story expiration

This gives us the backend domain/modules.

2. Backend technology stack

For this project, I recommend:

Purpose	Technology
Runtime	Node.js
Language	TypeScript
Framework	Express.js
Database	MySQL
ORM	Sequelize
Authentication	JWT
Password hashing	bcrypt
Validation	Zod
File upload	Multer
Image storage	Cloudinary
Real-time chat	Socket.IO
Environment variables	dotenv
Security headers	Helmet
CORS	cors
Rate limiting	express-rate-limit
Logging	Pino / Morgan
HTTP client testing	Postman / Bruno
API documentation	Swagger/OpenAPI
Testing	Jest + Supertest
Development	Nodemon / tsx
Code quality	ESLint + Prettier
Git hooks	Husky + lint-staged

You don't need to install all of them immediately.

We'll install them according to the stage where they're needed.

3. Prerequisites / downloads

Before creating the project, install these:

Required
1. Node.js

Install the current LTS version.

Check:

node -v
npm -v

You should see something similar to:

v22.x.x
10.x.x
2. Git

Check:

git --version
3. VS Code

You'll use VS Code for the project.

Useful extensions later:

ESLint
Prettier
Error Lens
Thunder Client
GitLens

You can also use Postman instead of Thunder Client.

4. MySQL

Install:

MySQL Server
MySQL Workbench

We'll use MySQL for the database.

You should eventually have:

Node.js
Git
VS Code
MySQL
MySQL Workbench
Postman
4. Create the project

Don't start with routes yet.

First create the backend project.

Your overall project could eventually look like:

pingup/
│
├── frontend/
│
└── backend/

If your frontend already exists separately, keep the backend separate.

Create:

mkdir pingup-backend
cd pingup-backend

Initialize npm:

npm init -y

Initialize Git:

git init

At this point we have an empty Node project.

5. TypeScript setup

Because your frontend is TypeScript, I'd strongly recommend using TypeScript for the backend too.

Install:

npm install typescript

Development dependencies:

npm install -D tsx @types/node

Then create the TypeScript configuration.

Conceptually:

backend
│
├── package.json
├── tsconfig.json
└── src/

We won't implement anything yet.

6. Install Express

Now install the actual backend framework:

npm install express

And Express types:

npm install -D @types/express

Now our backend stack is:

Node.js
   ↓
TypeScript
   ↓
Express

Think of Express as the layer responsible for:

HTTP Request
      ↓
Express
      ↓
Route
      ↓
Controller
      ↓
Service
      ↓
Database
      ↓
Response

This flow will become very important for interviews.

7. Install the database packages

We're going to use:

MySQL
+
Sequelize

Install:

npm install sequelize mysql2

And TypeScript types if required by the package you're using.

Our architecture becomes:

Express
   ↓
Controller
   ↓
Service
   ↓
Sequelize
   ↓
MySQL
8. Environment variables

Install:

npm install dotenv

We'll eventually have:

.env
.env.example

Your .env will contain things such as:

PORT
DATABASE_HOST
DATABASE_PORT
DATABASE_NAME
DATABASE_USER
DATABASE_PASSWORD

JWT_SECRET

CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

But never commit .env to Git.

Your .gitignore will contain:

node_modules
.env
dist
9. Authentication packages

Your application obviously requires authentication.

We'll eventually need:

npm install jsonwebtoken bcrypt

And:

npm install -D @types/jsonwebtoken @types/bcrypt

Authentication architecture:

Register
   ↓
Validate input
   ↓
Hash password
   ↓
Create user
   ↓
Login
   ↓
Verify password
   ↓
Create JWT
   ↓
Client

Then protected requests:

Request
   ↓
JWT
   ↓
Authentication middleware
   ↓
Verify token
   ↓
req.user
   ↓
Controller

We'll spend a separate lesson on this because authentication is one of the most important parts of the project.

10. Validation

We don't want the backend blindly accepting frontend data.

For example:

email
password
username
name
bio
location
post content

Install:

npm install zod

We'll use validation approximately like:

Request
   ↓
Validation
   ↓
Authentication
   ↓
Controller

This protects your API from invalid data.

11. Security packages

Install:

npm install helmet cors express-rate-limit

These will eventually handle things such as:

Helmet

Security-related HTTP headers.

CORS

Controls which frontend applications can communicate with your API.

For example:

localhost:5173
      ↓
localhost:5000
Rate limiting

Protect endpoints against excessive requests.

For example:

POST /api/auth/login

shouldn't be allowed to receive thousands of requests from the same client continuously.

12. File uploads

Your application has:

Profile picture
Cover photo
Post images
Story images
Message images

So we'll need file uploads.

Install:

npm install multer

Then we'll connect it to an image-storage service such as Cloudinary.

The architecture becomes:

Frontend
   ↓
Image
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

We generally don't want to store the actual image binary inside MySQL for this type of application.

Instead:

Cloudinary
    ↓
https://image-url...

and store the URL in the database.

13. Real-time messaging

Your Messages screen means we eventually need real-time communication.

We'll use:

npm install socket.io

The architecture will be:

User A
   │
   │ WebSocket
   ↓
Socket.IO
   │
   ↓
Backend
   │
   ↓
Socket.IO
   │
   ↓
User B

And separately:

Message
   ↓
MySQL

So Socket.IO handles real-time delivery, while MySQL provides persistent message history.

14. Logging

For development, you can start with:

npm install morgan

Later, for a more production-oriented backend, I'd recommend:

Pino

Logging should eventually help you answer:

Which request failed?
Which endpoint?
Which user?
What status code?
How long did it take?
What error occurred?
15. Your final package categories

Don't think of package.json as one huge list.

Think of it by responsibility.

Core
express
typescript
Database
sequelize
mysql2
Authentication
jsonwebtoken
bcrypt
Validation
zod
Security
helmet
cors
express-rate-limit
Files
multer
cloudinary
Real-time
socket.io
Configuration
dotenv
Development
tsx
nodemon
Testing
jest
supertest
Code quality
eslint
prettier
husky
lint-staged
16. Now the most important part: architecture

I don't recommend starting with:

controllers/
models/
routes/

and putting everything globally into those folders.

For a social-media application, I would use a feature-based modular architecture.

Something like:

src/
│
├── config/
│
├── modules/
│   │
│   ├── auth/
│   ├── users/
│   ├── posts/
│   ├── comments/
│   ├── likes/
│   ├── connections/
│   ├── stories/
│   ├── messages/
│   ├── notifications/
│   └── uploads/
│
├── middlewares/
│
├── database/
│
├── routes/
│
├── utils/
│
├── types/
│
├── app.ts
│
└── server.ts

But we can make it even better.

17. Detailed architecture

Inside a feature:

modules/
└── users/
    │
    ├── user.model.ts
    ├── user.controller.ts
    ├── user.service.ts
    ├── user.repository.ts
    ├── user.routes.ts
    ├── user.validation.ts
    └── user.types.ts

Each layer has a responsibility.

Route

Defines:

GET
POST
PATCH
DELETE

and connects them to controllers.

Controller

Responsible for:

Request
   ↓
Controller
   ↓
Service
   ↓
Response

It shouldn't contain complicated business logic.

Service

Contains business logic.

For example:

Follow user
Create post
Like post
Accept connection
Update profile
Repository

Responsible for database operations.

Conceptually:

Service
   ↓
Repository
   ↓
Sequelize
   ↓
MySQL

This separation becomes particularly valuable as your application grows.

Model

Defines the database representation.

For example:

User
Post
Comment
Message
Story
Validation

Defines what incoming data should look like.

For example:

RegisterRequest
LoginRequest
CreatePostRequest
UpdateProfileRequest
18. Full architecture

Eventually:

                   CLIENT
                     │
                     ▼
                Express API
                     │
              ┌──────┴──────┐
              │             │
          Middleware     Socket.IO
              │             │
              ▼             ▼
           Routes        Real-time
              │
              ▼
         Controllers
              │
              ▼
           Services
              │
              ▼
         Repositories
              │
              ▼
          Sequelize
              │
              ▼
            MySQL

And external services:

                 ┌──────────────┐
                 │   Cloudinary │
                 └──────▲───────┘
                        │
                        │
Client → Express → Service
                        │
                        ▼
                     Database
19. Complete folder structure

Eventually I'd aim for something close to:

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
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── users/
│   │   │   ├── user.model.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.validation.ts
│   │   │   └── user.types.ts
│   │   │
│   │   ├── posts/
│   │   │   ├── post.model.ts
│   │   │   ├── post.controller.ts
│   │   │   ├── post.service.ts
│   │   │   ├── post.repository.ts
│   │   │   ├── post.routes.ts
│   │   │   ├── post.validation.ts
│   │   │   └── post.types.ts
│   │   │
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

Don't create all of this today.

We'll build it progressively.