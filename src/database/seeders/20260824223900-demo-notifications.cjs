'use strict';

const { QueryTypes } = require('sequelize');

const {
  ALL_DEMO_EMAILS,
  fetchUsersByEmail,
  fetchDemoUserIds,
  mapByEmail,
} = require('../seed-helpers.cjs');

module.exports = {
  async up(queryInterface) {
    const users = await fetchUsersByEmail(queryInterface, ALL_DEMO_EMAILS);
    const userIdByEmail = mapByEmail(users);

    const posts = await queryInterface.sequelize.query(
      `SELECT id, user_id FROM posts
       WHERE user_id IN (:userIds)
       ORDER BY id ASC`,
      {
        replacements: {
          userIds: [
            userIdByEmail['alice@pingup.dev'],
            userIdByEmail['bob@pingup.dev'],
            userIdByEmail['carol@pingup.dev'],
          ],
        },
        type: QueryTypes.SELECT,
      },
    );

    const messages = await queryInterface.sequelize.query(
      `SELECT id, sender_id, receiver_id, upload_id FROM messages
       WHERE sender_id IN (:userIds) OR receiver_id IN (:userIds)
       ORDER BY id ASC`,
      {
        replacements: {
          userIds: [
            userIdByEmail['alice@pingup.dev'],
            userIdByEmail['bob@pingup.dev'],
            userIdByEmail['carol@pingup.dev'],
          ],
        },
        type: QueryTypes.SELECT,
      },
    );

    const alicePost = posts.find(
      (post) => post.user_id === userIdByEmail['alice@pingup.dev'],
    );
    const bobPost = posts.find(
      (post) => post.user_id === userIdByEmail['bob@pingup.dev'],
    );
    const imageMessage = messages.find(
      (message) => message.upload_id != null,
    );
    const now = new Date();

    await queryInterface.bulkInsert('notifications', [
      {
        recipient_id: userIdByEmail['alice@pingup.dev'],
        sender_id: userIdByEmail['bob@pingup.dev'],
        type: 'like',
        post_id: alicePost.id,
        message_id: null,
        content: 'Bob liked your post',
        is_read: true,
        created_at: now,
        updated_at: now,
      },
      {
        recipient_id: userIdByEmail['alice@pingup.dev'],
        sender_id: userIdByEmail['carol@pingup.dev'],
        type: 'comment',
        post_id: alicePost.id,
        message_id: null,
        content: 'Carol commented on your post',
        is_read: false,
        created_at: now,
        updated_at: now,
      },
      {
        recipient_id: userIdByEmail['bob@pingup.dev'],
        sender_id: userIdByEmail['alice@pingup.dev'],
        type: 'like',
        post_id: bobPost.id,
        message_id: null,
        content: 'Alice liked your post',
        is_read: true,
        created_at: now,
        updated_at: now,
      },
      {
        recipient_id: userIdByEmail['alice@pingup.dev'],
        sender_id: userIdByEmail['bob@pingup.dev'],
        type: 'message',
        post_id: null,
        message_id: imageMessage.id,
        content: 'Bob sent you a message',
        is_read: false,
        created_at: now,
        updated_at: now,
      },
      {
        recipient_id: userIdByEmail['alice@pingup.dev'],
        sender_id: userIdByEmail['carol@pingup.dev'],
        type: 'follow_request',
        post_id: null,
        message_id: null,
        content: 'Carol started following you',
        is_read: false,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const userIds = await fetchDemoUserIds(queryInterface);

    if (userIds.length === 0) {
      return;
    }

    await queryInterface.bulkDelete('notifications', {
      [Sequelize.Op.or]: [
        { recipient_id: { [Sequelize.Op.in]: userIds } },
        { sender_id: { [Sequelize.Op.in]: userIds } },
      ],
    });
  },
};
