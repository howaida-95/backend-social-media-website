// Then your application has one place where Sequelize relationships are initialized.

import User from '@modules/users/user.model';
import Post from '@modules/posts/post.model';
import Comment from '@modules/comments/comment.model';
// import Like from '../modules/likes/like.model.js';
// import Connection from '../modules/connections/connection.model.js';
// import Story from '../modules/stories/story.model.js';
// import Upload from '../modules/uploads/upload.model.js';
// import Message from '../modules/messages/message.model.js';
// import Notification from '../modules/notifications/notification.model.js';


  /*
|--------------------------------------------------------------------------
| Model Associations
|--------------------------------------------------------------------------
|
| Models
|   ↓
| represent database tables
|
| Associations
|   ↓
| define relationships between those tables
|
| This file is responsible ONLY for defining relationships.
|
*/

/*
|--------------------------------------------------------------------------
| Initialize Associations
|--------------------------------------------------------------------------
*/

export const setupAssociations = (): void => {
  /*
  |--------------------------------------------------------------------------
  | User ↔ Post
  |--------------------------------------------------------------------------
  |
  | A user can create many posts.
  | A post belongs to one user.
  |
  */

  User.hasMany(Post, {
    foreignKey: 'userId',
    as: 'posts',
    onDelete: 'CASCADE',
  });

  Post.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  /*
  |--------------------------------------------------------------------------
  | User ↔ Comment
  |--------------------------------------------------------------------------
  |
  | A user can create many comments.
  | A comment belongs to one user.
  |
  */

  User.hasMany(Comment, {
    foreignKey: 'userId',
    as: 'comments',
    onDelete: 'CASCADE',
  });

  Comment.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  /*
  |--------------------------------------------------------------------------
  | Post ↔ Comment
  |--------------------------------------------------------------------------
  |
  | A post can have many comments.
  | A comment belongs to one post.
  |
  */

  Post.hasMany(Comment, {
    foreignKey: 'postId',
    as: 'comments',
    onDelete: 'CASCADE',
  });

  Comment.belongsTo(Post, {
    foreignKey: 'postId',
    as: 'post',
  });

  /*
  |--------------------------------------------------------------------------
  | User ↔ Like
  |--------------------------------------------------------------------------
  |
  | A user can like many posts.
  | A like belongs to one user.
  |
  */

//   User.hasMany(Like, {
//     foreignKey: 'userId',
//     as: 'likes',
//     onDelete: 'CASCADE',
//   });

//   Like.belongsTo(User, {
//     foreignKey: 'userId',
//     as: 'user',
//   });

  /*
  |--------------------------------------------------------------------------
  | Post ↔ Like
  |--------------------------------------------------------------------------
  |
  | A post can have many likes.
  | A like belongs to one post.
  |
  */

//   Post.hasMany(Like, {
//     foreignKey: 'postId',
//     as: 'likes',
//     onDelete: 'CASCADE',
//   });

//   Like.belongsTo(Post, {
//     foreignKey: 'postId',
//     as: 'post',
//   });

  /*
  |--------------------------------------------------------------------------
  | User ↔ User (Followers)
  |--------------------------------------------------------------------------
  |
  | Self-referencing many-to-many relationship.
  |
  | Example:
  |
  | User A follows User B
  |
  | followerId  → User A
  | followingId → User B
  |
  */

//   User.belongsToMany(User, {
//     through: Follower,
//     foreignKey: 'followerId',
//     otherKey: 'followingId',
//     as: 'following',
//   });

//   User.belongsToMany(User, {
//     through: Follower,
//     foreignKey: 'followingId',
//     otherKey: 'followerId',
//     as: 'followers',
//   });

  /*
  |--------------------------------------------------------------------------
  | Follower ↔ User
  |--------------------------------------------------------------------------
  |
  | Explicit relationships for querying the junction table directly.
  |
  */

//   Follower.belongsTo(User, {
//     foreignKey: 'followerId',
//     as: 'follower',
//   });

//   Follower.belongsTo(User, {
//     foreignKey: 'followingId',
//     as: 'following',
//   });

//   User.hasMany(Follower, {
//     foreignKey: 'followerId',
//     as: 'followingRelations',
//     onDelete: 'CASCADE',
//   });

//   User.hasMany(Follower, {
//     foreignKey: 'followingId',
//     as: 'followerRelations',
//     onDelete: 'CASCADE',
//   });

  /*
  |--------------------------------------------------------------------------
  | User ↔ Story
  |--------------------------------------------------------------------------
  |
  | A user can create many stories.
  | A story belongs to one user.
  |
  */

//   User.hasMany(Story, {
//     foreignKey: 'userId',
//     as: 'stories',
//     onDelete: 'CASCADE',
//   });

//   Story.belongsTo(User, {
//     foreignKey: 'userId',
//     as: 'user',
//   });

  /*
  |--------------------------------------------------------------------------
  | User ↔ Message
  |--------------------------------------------------------------------------
  |
  | A message has:
  |
  | senderId
  | receiverId
  |
  | Both point to the User table.
  |
  */

//   User.hasMany(Message, {
//     foreignKey: 'senderId',
//     as: 'sentMessages',
//     onDelete: 'CASCADE',
//   });

//   User.hasMany(Message, {
//     foreignKey: 'receiverId',
//     as: 'receivedMessages',
//     onDelete: 'CASCADE',
//   });

//   Message.belongsTo(User, {
//     foreignKey: 'senderId',
//     as: 'sender',
//   });

//   Message.belongsTo(User, {
//     foreignKey: 'receiverId',
//     as: 'receiver',
//   });
};

setupAssociations();
