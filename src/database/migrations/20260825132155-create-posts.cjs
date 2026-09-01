'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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

      content: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      image_url: {
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

    await queryInterface.addIndex('posts', ['user_id']);
    await queryInterface.addIndex('posts', ['created_at']);
    await queryInterface.addIndex('posts', ['user_id', 'created_at']);
    await queryInterface.addIndex('posts', ['upload_id'], {
      name: 'posts_upload_id_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('posts');
  },
};
