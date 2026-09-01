'use strict';

const { QueryTypes } = require('sequelize');

const {
  DEMO_USER_EMAILS,
  fetchUsersByEmail,
  fetchDemoUserIds,
  mapByEmail,
} = require('../seed-helpers.cjs');

module.exports = {
  async up(queryInterface) {
    const users = await fetchUsersByEmail(queryInterface, DEMO_USER_EMAILS);
    const userIdByEmail = mapByEmail(users);

    const posts = await queryInterface.sequelize.query(
      `SELECT id, user_id, content FROM posts
       WHERE user_id IN (:userIds)
       ORDER BY id ASC`,
      {
        replacements: { userIds: Object.values(userIdByEmail) },
        type: QueryTypes.SELECT,
      },
    );

    const aliceFirstPost = posts.find(
      (post) =>
        post.user_id === userIdByEmail['alice@pingup.dev'] &&
        post.content.includes('Hello PingUp'),
    );
    const bobPost = posts.find(
      (post) => post.user_id === userIdByEmail['bob@pingup.dev'],
    );
    const now = new Date();

    await queryInterface.bulkInsert('comments', [
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        post_id: aliceFirstPost.id,
        content: 'Welcome to PingUp, Alice! Great to have you here.',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['carol@pingup.dev'],
        post_id: aliceFirstPost.id,
        content: 'Hey Alice! Looking forward to your posts.',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['alice@pingup.dev'],
        post_id: bobPost.id,
        content: 'Stunning shot, Bob!',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const userIds = await fetchDemoUserIds(queryInterface);

    if (userIds.length === 0) {
      return;
    }

    await queryInterface.bulkDelete('comments', {
      user_id: { [Sequelize.Op.in]: userIds },
    });
  },
};
