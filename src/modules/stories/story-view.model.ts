/* junction table (many to many relationship) */

import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@config/database';

class StoryView extends Model<
  InferAttributes<StoryView>,
  InferCreationAttributes<StoryView>
> {
  declare id: CreationOptional<number>;

  declare storyId: number;
  declare userId: number;

  declare viewedAt: CreationOptional<Date>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

StoryView.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    storyId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'stories',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'story_id',
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'user_id',
    },

    viewedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'viewed_at',
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
  },
  {
    sequelize,
    tableName: 'story_views',
    modelName: 'StoryView',

    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ['story_id', 'user_id'],
        name: 'story_views_story_user_unique',
      },
      {
        fields: ['story_id'],
        name: 'story_views_story_id_idx',
      },
      {
        fields: ['user_id'],
        name: 'story_views_user_id_idx',
      },
    ],
  },
);

export default StoryView;