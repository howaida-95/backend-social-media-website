import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('posts', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  // Add indexes
  await queryInterface.addIndex('posts', ['user_id']);
  await queryInterface.addIndex('posts', ['created_at']);
  await queryInterface.addIndex('posts', ['user_id', 'created_at']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('posts');
}