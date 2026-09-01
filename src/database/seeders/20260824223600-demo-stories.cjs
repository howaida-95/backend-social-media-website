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
      SEED_PUBLIC_IDS.STORY_CAROL,
    ]);
    const storyUpload = uploads[0];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('stories', [
      {
        user_id: userIdByEmail['alice@pingup.dev'],
        type: 'text',
        content: 'Coffee and code ☕',
        media_url: null,
        upload_id: null,
        background_color: '#4F46E5',
        views_count: 2,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        type: 'text',
        content: 'Behind the lens today 📸',
        media_url: null,
        upload_id: null,
        background_color: '#059669',
        views_count: 1,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      },
      {
        user_id: userIdByEmail['carol@pingup.dev'],
        type: 'image',
        content: null,
        media_url: storyUpload?.url ?? null,
        upload_id: storyUpload?.id ?? null,
        background_color: '#4F46E5',
        views_count: 2,
        expires_at: expiresAt,
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

    await queryInterface.bulkDelete('stories', {
      user_id: { [Sequelize.Op.in]: userIds },
    });
  },
};
