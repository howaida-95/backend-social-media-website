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
      `SELECT id, user_id FROM posts WHERE user_id IN (:userIds) ORDER BY id ASC`,
      {
        replacements: { userIds: Object.values(userIdByEmail) },
        type: QueryTypes.SELECT,
      },
    );

    const aliceFirstPost = posts.find(
      (post) => post.user_id === userIdByEmail['alice@pingup.dev'],
    );
    const bobPost = posts.find(
      (post) => post.user_id === userIdByEmail['bob@pingup.dev'],
    );
    const carolPost = posts.find(
      (post) => post.user_id === userIdByEmail['carol@pingup.dev'],
    );
    const now = new Date();

    await queryInterface.bulkInsert('likes', [
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        post_id: aliceFirstPost.id,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userIdByEmail['carol@pingup.dev'],
        post_id: aliceFirstPost.id,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userIdByEmail['alice@pingup.dev'],
        post_id: bobPost.id,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        post_id: carolPost.id,
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

    await queryInterface.bulkDelete('likes', {
      user_id: { [Sequelize.Op.in]: userIds },
    });
  },
};
