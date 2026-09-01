'use strict';

const bcrypt = require('bcrypt');

const DEMO_EMAILS = [
  'admin@pingup.dev',
  'alice@pingup.dev',
  'bob@pingup.dev',
  'carol@pingup.dev',
];

const DEMO_PASSWORD = 'Password123!';

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Admin',
        last_name: 'User',
        username: 'admin',
        email: DEMO_EMAILS[0],
        password: passwordHash,
        avatar: null,
        avatar_upload_id: null,
        cover_upload_id: null,
        bio: 'Platform administrator',
        role: 'admin',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        first_name: 'Alice',
        last_name: 'Johnson',
        username: 'alice',
        email: DEMO_EMAILS[1],
        password: passwordHash,
        avatar: null,
        avatar_upload_id: null,
        cover_upload_id: null,
        bio: 'Coffee lover. Building in public.',
        role: 'user',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        first_name: 'Bob',
        last_name: 'Smith',
        username: 'bobsmith',
        email: DEMO_EMAILS[2],
        password: passwordHash,
        avatar: null,
        avatar_upload_id: null,
        cover_upload_id: null,
        bio: 'Photographer and traveler.',
        role: 'user',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        first_name: 'Carol',
        last_name: 'Davis',
        username: 'carold',
        email: DEMO_EMAILS[3],
        password: passwordHash,
        avatar: null,
        avatar_upload_id: null,
        cover_upload_id: null,
        bio: 'Designer. Dog mom.',
        role: 'user',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: { [Sequelize.Op.in]: DEMO_EMAILS },
    });
  },
};
