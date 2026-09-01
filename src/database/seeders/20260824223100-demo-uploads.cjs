'use strict';

const { QueryTypes } = require('sequelize');

const {
  ALL_DEMO_EMAILS,
  SEED_PUBLIC_IDS,
  fetchUsersByEmail,
  mapByEmail,
} = require('../seed-helpers.cjs');

const SEED_PUBLIC_ID_LIST = Object.values(SEED_PUBLIC_IDS);

module.exports = {
  async up(queryInterface) {
    const users = await fetchUsersByEmail(queryInterface, ALL_DEMO_EMAILS);
    const userIdByEmail = mapByEmail(users);
    const now = new Date();

    await queryInterface.bulkInsert('uploads', [
      {
        user_id: userIdByEmail['alice@pingup.dev'],
        url: 'https://picsum.photos/seed/pingup-alice-avatar/400/400',
        public_id: SEED_PUBLIC_IDS.AVATAR_ALICE,
        original_name: 'alice-avatar.jpg',
        mime_type: 'image/jpeg',
        size: 245_760,
        purpose: 'avatar',
        status: 'attached',
        resource_type: 'image',
        width: 400,
        height: 400,
        format: 'jpg',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['alice@pingup.dev'],
        url: 'https://picsum.photos/seed/pingup-alice-cover/1200/400',
        public_id: SEED_PUBLIC_IDS.COVER_ALICE,
        original_name: 'alice-cover.jpg',
        mime_type: 'image/jpeg',
        size: 512_000,
        purpose: 'cover',
        status: 'attached',
        resource_type: 'image',
        width: 1200,
        height: 400,
        format: 'jpg',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        url: 'https://picsum.photos/seed/pingup-bob-avatar/400/400',
        public_id: SEED_PUBLIC_IDS.AVATAR_BOB,
        original_name: 'bob-avatar.jpg',
        mime_type: 'image/jpeg',
        size: 198_432,
        purpose: 'avatar',
        status: 'attached',
        resource_type: 'image',
        width: 400,
        height: 400,
        format: 'jpg',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        url: 'https://picsum.photos/seed/pingup-bob-post/1080/1080',
        public_id: SEED_PUBLIC_IDS.POST_BOB,
        original_name: 'golden-hour.jpg',
        mime_type: 'image/jpeg',
        size: 890_112,
        purpose: 'post',
        status: 'attached',
        resource_type: 'image',
        width: 1080,
        height: 1080,
        format: 'jpg',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['carol@pingup.dev'],
        url: 'https://picsum.photos/seed/pingup-carol-story/1080/1920',
        public_id: SEED_PUBLIC_IDS.STORY_CAROL,
        original_name: 'ui-kit-preview.jpg',
        mime_type: 'image/jpeg',
        size: 654_321,
        purpose: 'story',
        status: 'attached',
        resource_type: 'image',
        width: 1080,
        height: 1920,
        format: 'jpg',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        user_id: userIdByEmail['bob@pingup.dev'],
        url: 'https://picsum.photos/seed/pingup-message/800/600',
        public_id: SEED_PUBLIC_IDS.MESSAGE_IMAGE,
        original_name: 'location-pin.jpg',
        mime_type: 'image/jpeg',
        size: 321_000,
        purpose: 'message',
        status: 'attached',
        resource_type: 'image',
        width: 800,
        height: 600,
        format: 'jpg',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ]);

    const uploads = await queryInterface.sequelize.query(
      `SELECT id, public_id, url FROM uploads WHERE public_id IN (:publicIds)`,
      {
        replacements: { publicIds: SEED_PUBLIC_ID_LIST },
        type: QueryTypes.SELECT,
      },
    );

    const uploadByPublicId = Object.fromEntries(
      uploads.map((upload) => [upload.public_id, upload]),
    );

    await queryInterface.bulkUpdate(
      'users',
      {
        avatar_upload_id: uploadByPublicId[SEED_PUBLIC_IDS.AVATAR_ALICE].id,
        avatar: uploadByPublicId[SEED_PUBLIC_IDS.AVATAR_ALICE].url,
        cover_upload_id: uploadByPublicId[SEED_PUBLIC_IDS.COVER_ALICE].id,
        updated_at: now,
      },
      { email: 'alice@pingup.dev' },
    );

    await queryInterface.bulkUpdate(
      'users',
      {
        avatar_upload_id: uploadByPublicId[SEED_PUBLIC_IDS.AVATAR_BOB].id,
        avatar: uploadByPublicId[SEED_PUBLIC_IDS.AVATAR_BOB].url,
        updated_at: now,
      },
      { email: 'bob@pingup.dev' },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate(
      'users',
      {
        avatar_upload_id: null,
        cover_upload_id: null,
        avatar: null,
        updated_at: new Date(),
      },
      {
        email: { [Sequelize.Op.in]: ALL_DEMO_EMAILS },
      },
    );

    await queryInterface.bulkDelete('uploads', {
      public_id: { [Sequelize.Op.in]: SEED_PUBLIC_ID_LIST },
    });
  },
};
