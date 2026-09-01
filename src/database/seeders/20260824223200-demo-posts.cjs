'use strict';

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
        image_url: null,
        upload_id: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        content: 'Golden hour shot from the weekend. No filter needed.',
        image_url: postBobUpload?.url ?? null,
        upload_id: postBobUpload?.id ?? null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['carol@pingup.dev'],
        content: 'Working on a new UI kit. Feedback welcome!',
        image_url: null,
        upload_id: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['alice@pingup.dev'],
        content: 'Second post — loving this community already.',
        image_url: null,
        upload_id: null,
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

    await queryInterface.bulkDelete('posts', {
      user_id: { [Sequelize.Op.in]: userIds },
    });
  },
};
