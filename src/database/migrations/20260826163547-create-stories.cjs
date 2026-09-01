'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stories', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      type: {
        type: Sequelize.ENUM('text', 'image', 'video'),
        allowNull: false,
        defaultValue: 'text',
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      media_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      upload_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'uploads',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      background_color: {
        type: Sequelize.STRING(7),
        allowNull: true,
        defaultValue: '#4F46E5',
      },

      views_count: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('stories', ['user_id'], {
      name: 'stories_user_id_index',
    });

    await queryInterface.addIndex('stories', ['expires_at'], {
      name: 'stories_expires_at_index',
    });

    await queryInterface.addIndex('stories', ['upload_id'], {
      name: 'stories_upload_id_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stories');

    // Remove ENUM type left behind by MySQL/PostgreSQL when necessary.
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_stories_type";'
      );
    }
  },
};