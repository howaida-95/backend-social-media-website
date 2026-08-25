# Pingup Database Design

## Entities & Relationships
- Users (1) ↔ (M) Posts
- Users (1) ↔ (M) Messages
- Users (M) ↔ (M) Users (followers through junction table)
- Posts (1) ↔ (M) Likes (unique constraint: user_post)
- Posts (1) ↔ (M) Comments

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
Quick Answer to Your Question
Scenario	                        Use Migrations?
- Building initial schema (Pingup)	✅ YES
- Making ANY schema change	        ✅ YES
- Updating existing data in prod	✅ YES
- Local development	                ✅ YES
- Team project	                    ✅ YES

TLDR: Always use migrations. No exceptions.

npx sequelize-cli migration:generate --name create-users --migrations-path src/database/migrations

"db:migrate": "sequelize-cli db:migrate --config sequelize.config.cjs",