'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('story_views', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      storyId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'stories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      viewedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // A user can view a particular story only once.
    await queryInterface.addConstraint('story_views', {
      fields: ['storyId', 'userId'],
      type: 'unique',
      name: 'unique_story_view',
    });

    // Useful for finding all viewers of a story.
    await queryInterface.addIndex('story_views', ['storyId'], {
      name: 'story_views_story_id_index',
    });

    // Useful for finding all stories viewed by a user.
    await queryInterface.addIndex('story_views', ['userId'], {
      name: 'story_views_user_id_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('story_views');
  },
};