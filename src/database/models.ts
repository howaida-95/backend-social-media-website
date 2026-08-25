// Then your application has one place where Sequelize relationships are initialized.

import User from '@modules/users/user.model.js';
// import Post from '../modules/posts/post.model.js';
// import Comment from '../modules/comments/comment.model.js';
// import Like from '../modules/likes/like.model.js';
// import Connection from '../modules/connections/connection.model.js';
// import Story from '../modules/stories/story.model.js';
// import Upload from '../modules/uploads/upload.model.js';
// import Message from '../modules/messages/message.model.js';
// import Notification from '../modules/notifications/notification.model.js';

/*
 * User → Posts
 */
// User.hasMany(Post, {
//   foreignKey: 'userId',
//   as: 'posts',
// });

// Post.belongsTo(User, {
//   foreignKey: 'userId',
//   as: 'author',
// });

export {
  User,
  // Post,
  // Comment,
  // Like,
  // Connection,
  // Story,
  // Upload,
  // Message,
  // Notification,
};