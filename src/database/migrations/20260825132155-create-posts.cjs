'use strict';

export async function up(queryInterface, Sequelize) {
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
  await queryInterface.addIndex('posts', ['user_id']);
  await queryInterface.addIndex('posts', ['created_at']);
  await queryInterface.addIndex('posts', ['user_id', 'created_at']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('posts');
}