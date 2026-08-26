'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
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

        field: 'user_id',
      },

      postId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,

        references: {
          model: 'posts',
          key: 'id',
        },

        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',

        field: 'post_id',
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at',
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at',
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at',
      },
    });

    await queryInterface.addIndex('comments', ['user_id']);

    await queryInterface.addIndex('comments', ['post_id']);

    await queryInterface.addIndex('comments', ['post_id', 'created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('comments');
  },
};