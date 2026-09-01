'use strict';

const { QueryTypes } = require('sequelize');

const ALL_DEMO_EMAILS = [
  'admin@pingup.dev',
  'alice@pingup.dev',
  'bob@pingup.dev',
  'carol@pingup.dev',
];

const DEMO_USER_EMAILS = [
  'alice@pingup.dev',
  'bob@pingup.dev',
  'carol@pingup.dev',
];

const SEED_PUBLIC_IDS = {
  AVATAR_ALICE: 'seed/pingup/avatar-alice',
  COVER_ALICE: 'seed/pingup/cover-alice',
  AVATAR_BOB: 'seed/pingup/avatar-bob',
  POST_BOB: 'seed/pingup/post-bob-1',
  STORY_CAROL: 'seed/pingup/story-carol-1',
  MESSAGE_IMAGE: 'seed/pingup/message-bob-alice',
};

async function fetchUsersByEmail(queryInterface, emails) {
  return queryInterface.sequelize.query(
    `SELECT id, email, username FROM users WHERE email IN (:emails)`,
    {
      replacements: { emails },
      type: QueryTypes.SELECT,
    },
  );
}

function mapByEmail(rows, field = 'id') {
  return Object.fromEntries(rows.map((row) => [row.email, row[field]]));
}

async function fetchDemoUserIds(queryInterface) {
  const users = await fetchUsersByEmail(queryInterface, ALL_DEMO_EMAILS);
  return users.map((user) => user.id);
}

async function fetchUploadsByPublicId(queryInterface, publicIds) {
  return queryInterface.sequelize.query(
    `SELECT id, public_id, url FROM uploads WHERE public_id IN (:publicIds)`,
    {
      replacements: { publicIds },
      type: QueryTypes.SELECT,
    },
  );
}

function mapByPublicId(rows, field = 'id') {
  return Object.fromEntries(rows.map((row) => [row.public_id, row[field]]));
}

module.exports = {
  ALL_DEMO_EMAILS,
  DEMO_USER_EMAILS,
  SEED_PUBLIC_IDS,
  fetchUsersByEmail,
  mapByEmail,
  fetchDemoUserIds,
  fetchUploadsByPublicId,
  mapByPublicId,
};
