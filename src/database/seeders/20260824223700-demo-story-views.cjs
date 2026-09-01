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

    const stories = await queryInterface.sequelize.query(
      `SELECT id, user_id FROM stories WHERE user_id IN (:userIds) ORDER BY id ASC`,
      {
        replacements: { userIds: Object.values(userIdByEmail) },
        type: QueryTypes.SELECT,
      },
    );

    const aliceStory = stories.find(
      (story) => story.user_id === userIdByEmail['alice@pingup.dev'],
    );
    const bobStory = stories.find(
      (story) => story.user_id === userIdByEmail['bob@pingup.dev'],
    );
    const carolStory = stories.find(
      (story) => story.user_id === userIdByEmail['carol@pingup.dev'],
    );
    const now = new Date();

    await queryInterface.bulkInsert('story_views', [
      {
        storyId: aliceStory.id,
        userId: userIdByEmail['bob@pingup.dev'],
        viewedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        storyId: aliceStory.id,
        userId: userIdByEmail['carol@pingup.dev'],
        viewedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        storyId: bobStory.id,
        userId: userIdByEmail['alice@pingup.dev'],
        viewedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        storyId: carolStory.id,
        userId: userIdByEmail['alice@pingup.dev'],
        viewedAt: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        storyId: carolStory.id,
        userId: userIdByEmail['bob@pingup.dev'],
        viewedAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    const userIds = await fetchDemoUserIds(queryInterface);

    if (userIds.length === 0) {
      return;
    }

    const stories = await queryInterface.sequelize.query(
      `SELECT id FROM stories WHERE user_id IN (:userIds)`,
      {
        replacements: { userIds },
        type: QueryTypes.SELECT,
      },
    );

    const storyIds = stories.map((story) => story.id);

    if (storyIds.length === 0) {
      return;
    }

    await queryInterface.bulkDelete('story_views', {
      storyId: { [Sequelize.Op.in]: storyIds },
    });
  },
};
