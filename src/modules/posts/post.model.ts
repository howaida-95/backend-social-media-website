import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@config/database';

class Post extends Model <InferAttributes<Post>,InferCreationAttributes<Post>> {
  declare id: CreationOptional<number>;

  declare userId: number;

  declare content: string | null;

  declare imageUrl: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      field: 'user_id',
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 5000],
      },
    },

    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'image_url',
      validate: {
        isUrl: true,
      },
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'posts',
    modelName: 'Post',
    timestamps: true,
    underscored: true,
    paranoid: true,

    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['user_id', 'created_at'],
      },
    ],
  },
);

export default Post;

// Set up associations after model definition
Post.associate = (models: any) => {
  Post.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'author',
  });

  Post.hasMany(models.Comment, {
    foreignKey: 'postId',
    as: 'comments',
    onDelete: 'CASCADE',
  });
};