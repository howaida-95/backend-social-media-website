'use strict';

const { QueryTypes } = require('sequelize');

const {
  DEMO_USER_EMAILS,
  SEED_PUBLIC_IDS,
  fetchUsersByEmail,
  fetchDemoUserIds,
  mapByEmail,
  fetchUploadsByPublicId,
} = require('../seed-helpers.cjs');

module.exports = {
  async up(queryInterface) {
    const users = await fetchUsersByEmail(queryInterface, DEMO_USER_EMAILS);
    const userIdByEmail = mapByEmail(users);

    const uploads = await fetchUploadsByPublicId(queryInterface, [
      SEED_PUBLIC_IDS.POST_BOB,
    ]);
    const postBobUpload = uploads[0];
    const now = new Date();

    await queryInterface.bulkInsert('posts', [
      {
        user_id: userIdByEmail['alice@pingup.dev'],
        content: 'Hello PingUp! Excited to share my first post here.',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        content: 'Golden hour shot from the weekend. No filter needed.',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['carol@pingup.dev'],
        content: 'Working on a new UI kit. Feedback welcome!',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['alice@pingup.dev'],
        content: 'Second post — loving this community already.',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ]);

    if (postBobUpload) {
      const [bobPost] = await queryInterface.sequelize.query(
        `SELECT id FROM posts
         WHERE user_id = :userId AND content = :content
         ORDER BY id DESC LIMIT 1`,
        {
          replacements: {
            userId: userIdByEmail['bob@pingup.dev'],
            content: 'Golden hour shot from the weekend. No filter needed.',
          },
          type: QueryTypes.SELECT,
        },
      );

      if (!bobPost) {
        throw new Error('Could not find the seeded Bob post to attach its upload');
      }

      await queryInterface.bulkInsert('post_images', [
        {
          post_id: bobPost.id,
          upload_id: postBobUpload.id,
          position: 0,
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    const userIds = await fetchDemoUserIds(queryInterface);

    if (userIds.length === 0) {
      return;
    }

    await queryInterface.bulkDelete('posts', {
      user_id: { [Sequelize.Op.in]: userIds },
    });
  },
};
