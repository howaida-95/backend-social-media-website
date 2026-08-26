# Pingup Database Design
https://chatgpt.com/g/g-p-6a792f8cb0088191b65d15e0dcc54d46/c/6a8cab1d-f64c-83ea-b208-653a8e8e0350 
## Entities & Relationships
- Users (1) ↔ (M) Posts 
=> (one user can create multiple posts, but one post belongs only to one user)
- User (1) ↔ (M) Comments
- Posts (1) ↔ (M) Comments
=>  comment belong to  one user & to one post 
- user (1) ↔ (M) Likes 
- Posts (1) ↔ (M) Likes (unique constraint: user_post)
=> User 1 ──────── * Like * ──────── 1 Post
=> like represents  Which user liked which post?
- User (connections)
 │
 ├── following → Users (User who follows)
 │
 └── followers → Users (User being followed)

- user & story 
User
 │
 ├── stories ────────────> Story
 │
 └── viewedStories <───── Story
                              │
                              └── viewers ──> User
A junction table is a table used to represent a many-to-many relationship between two other tables.
User ←──────→ Story
For example:

User ←──────→ Story

Ask:

Can one user be associated with many stories?

Yes.

Can one story be associated with many users?

Yes, if we're talking about users who viewed the story.

Therefore:

User        Story
  │           │
  │           │
  └──────┬────┘
         │
         ▼
    StoryView

StoryView is the junction table.


- Users (1) ↔ (M) Messages
- Users (M) ↔ (M) Users (followers through junction table)

## Indexing Strategy
- Users: email, username (unique indexes)
- Posts: userId, createdAt (for feed pagination)
- Messages: senderId, recipientId, createdAt
- Followers: (followerId, followingId) unique

## Denormalization Decisions
- Store likesCount, commentsCount on Posts (increment atomically)
- Store followerCount on Users

## Constraints
- Email must be unique
- Username must be unique
- User can't follow themselves
- User can't like same post twice


Checklist Before Writing Code

✅ Do this FIRST:

 ER Diagram created & reviewed
 All tables, relationships defined
 Indexes planned for queries
 Constraints documented
 API endpoints documented
 Response schemas defined
 Error handling defined
 Team agrees on schema

✅ For  Tech Stack (TypeScript + Sequelize)
1. Design DB schema (SQL)
   ↓
2. Create Sequelize models (auto-generate from schema)
   ↓
3. Generate migrations from models
   ↓
4. Write services/controllers

This prevents:
Model changes → migration disasters
API breaking changes
Frontend guessing what data structure is


✅ migrations
(If Git tracks changes to your code, migrations track changes to your database schema.)
migration has 2 directions:
- up(): Moves your database forward (CREATE TABLE users)
- down(): Reverts the migration(DROP TABLE users)
This is extremely important in a professional backend because you can move between database versions.

Quick Answer to Your Question
Scenario	                        Use Migrations?
- Building initial schema (Pingup)  ✅ YES
- Making ANY schema change	         ✅ YES
- Updating existing data in prod	   ✅ YES
- Local development	               ✅ YES
- Team project	                     ✅ YES

TLDR: Always use migrations. No exceptions.

npx sequelize-cli migration:generate --name create-comments --migrations-path src/database/migrations

"db:migrate": "sequelize-cli db:migrate --config sequelize.config.cjs",

## Migration vs Model ## 
- Migration: Responsible for changing the database structure.
- Model: Responsible for allowing your Node.js application to work with that table.

So don't think:
"The model creates my database."
Instead:
Migration defines and changes the database schema, while the Sequelize model represents that schema inside the application.
