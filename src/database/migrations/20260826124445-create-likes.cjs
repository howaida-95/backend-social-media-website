'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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

      post_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    });

    // A user can like a post only once.
    await queryInterface.addConstraint('likes', {
      fields: ['user_id', 'post_id'],
      type: 'unique',
      name: 'unique_user_post_like',
    });

    // Faster lookup for all likes belonging to a post.
    await queryInterface.addIndex('likes', ['post_id'], {
      name: 'likes_post_id_index',
    });

    // Faster lookup for all likes made by a user.
    await queryInterface.addIndex('likes', ['user_id'], {
      name: 'likes_user_id_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('likes');
  },
};