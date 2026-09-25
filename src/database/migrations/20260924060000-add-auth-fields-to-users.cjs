'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');

    if (!table.email_verified) {
      await queryInterface.addColumn('users', 'email_verified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      await queryInterface.addIndex('users', ['email_verified']);
    }

    if (!table.reset_password_token) {
      await queryInterface.addColumn('users', 'reset_password_token', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      });
    }

    if (!table.reset_password_expires) {
      await queryInterface.addColumn('users', 'reset_password_expires', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!table.provider) {
      await queryInterface.addColumn('users', 'provider', {
        type: Sequelize.ENUM('google', 'local'),
        allowNull: true,
        defaultValue: 'local',
      });
    }

    if (!table.google_id) {
      await queryInterface.addColumn('users', 'google_id', {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      });
      await queryInterface.addIndex('users', ['google_id'], { unique: true });
    }

    // Google users have no password
    if (table.password && table.password.allowNull === false) {
      await queryInterface.changeColumn('users', 'password', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('users');

    if (table.google_id) {
      await queryInterface.removeColumn('users', 'google_id');
    }
    if (table.provider) {
      await queryInterface.removeColumn('users', 'provider');
      // ENUM cleanup on MySQL may leave type behind; ignore for undo
    }
    if (table.reset_password_expires) {
      await queryInterface.removeColumn('users', 'reset_password_expires');
    }
    if (table.reset_password_token) {
      await queryInterface.removeColumn('users', 'reset_password_token');
    }
    if (table.email_verified) {
      await queryInterface.removeColumn('users', 'email_verified');
    }
  },
};
