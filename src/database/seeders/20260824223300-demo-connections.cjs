'use strict';

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
    const now = new Date();

    await queryInterface.bulkInsert('connections', [
      {
        follower_id: userIdByEmail['alice@pingup.dev'],
        following_id: userIdByEmail['bob@pingup.dev'],
        created_at: now,
        updated_at: now,
      },
      {
        follower_id: userIdByEmail['alice@pingup.dev'],
        following_id: userIdByEmail['carol@pingup.dev'],
        created_at: now,
        updated_at: now,
      },
      {
        follower_id: userIdByEmail['bob@pingup.dev'],
        following_id: userIdByEmail['alice@pingup.dev'],
        created_at: now,
        updated_at: now,
      },
      {
        follower_id: userIdByEmail['carol@pingup.dev'],
        following_id: userIdByEmail['alice@pingup.dev'],
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

    await queryInterface.bulkDelete('connections', {
      [Sequelize.Op.or]: [
        { follower_id: { [Sequelize.Op.in]: userIds } },
        { following_id: { [Sequelize.Op.in]: userIds } },
      ],
    });
  },
};
