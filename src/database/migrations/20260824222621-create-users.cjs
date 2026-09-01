'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      avatar: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      avatar_upload_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      cover_upload_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      role: {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user',
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};