import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@config/database';

class Story extends Model<
  InferAttributes<Story>,
  InferCreationAttributes<Story>
> {
  declare id: CreationOptional<number>;

  declare userId: number;

  declare type: 'text' | 'image' | 'video';

  declare content: string | null;
  declare mediaUrl: string | null;

  declare backgroundColor: CreationOptional<string>;

  declare viewsCount: CreationOptional<number>;

  declare expiresAt: Date;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Story.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },

    type: {
      type: DataTypes.ENUM('text', 'image', 'video'),
      allowNull: false,
      defaultValue: 'text',
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    mediaUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'media_url',
    },

    backgroundColor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#4F46E5',
      field: 'background_color',
    },

    viewsCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'views_count',
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'stories',
    modelName: 'Story',
    underscored: true,
    timestamps: true,

    hooks: {
      beforeValidate: (story) => {
        if (!story.expiresAt) {
          story.expiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000
          );
        }
      },
    },

    validate: {
      hasContent() {
        if (this.type === 'text' && !this.content) {
          throw new Error('Text stories require content.');
        }

        if (this.type !== 'text' && !this.mediaUrl) {
          throw new Error(
            'Photo/video stories require a mediaUrl.'
          );
        }
      },
    },

    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['expires_at'],
      },
    ],
  }
);

export default Story;