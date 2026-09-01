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
      SEED_PUBLIC_IDS.MESSAGE_IMAGE,
    ]);
    const messageUpload = uploads[0];
    const now = new Date();

    await queryInterface.bulkInsert('messages', [
      {
        sender_id: userIdByEmail['alice@pingup.dev'],
        receiver_id: userIdByEmail['bob@pingup.dev'],
        text: 'Hey Bob! Loved your latest post.',
        image_url: null,
        upload_id: null,
        is_read: true,
        created_at: now,
        updated_at: now,
      },
      {
        sender_id: userIdByEmail['bob@pingup.dev'],
        receiver_id: userIdByEmail['alice@pingup.dev'],
        text: 'Thanks Alice! Means a lot.',
        image_url: null,
        upload_id: null,
        is_read: true,
        created_at: now,
        updated_at: now,
      },
      {
        sender_id: userIdByEmail['bob@pingup.dev'],
        receiver_id: userIdByEmail['alice@pingup.dev'],
        text: 'Meet here for coffee?',
        image_url: messageUpload?.url ?? null,
        upload_id: messageUpload?.id ?? null,
        is_read: false,
        created_at: now,
        updated_at: now,
      },
      {
        sender_id: userIdByEmail['carol@pingup.dev'],
        receiver_id: userIdByEmail['alice@pingup.dev'],
        text: 'Can I get your feedback on the UI kit post?',
        image_url: null,
        upload_id: null,
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

    await queryInterface.bulkDelete('messages', {
      [Sequelize.Op.or]: [
        { sender_id: { [Sequelize.Op.in]: userIds } },
        { receiver_id: { [Sequelize.Op.in]: userIds } },
      ],
    });
  },
};
