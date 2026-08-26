import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@config/database';

class Notification extends Model<
  InferAttributes<Notification>,
  InferCreationAttributes<Notification>
> {
  declare id: CreationOptional<number>;

  // User who receives the notification
  declare recipientId: number;

  // User who triggered the notification
  declare senderId: number | null;

  declare type:
    | 'like'
    | 'comment'
    | 'follow_request'
    | 'follow_accept'
    | 'message'
    | 'mention'
    | 'profile_view';

  // Related post, if applicable
  declare postId: number | null;

  // Related message, if applicable
  declare messageId: number | null;

  // Notification preview/content
  declare content: string | null;

  declare isRead: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    recipientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'recipient_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'sender_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    type: {
      type: DataTypes.ENUM(
        'like',
        'comment',
        'follow_request',
        'follow_accept',
        'message',
        'mention',
        'profile_view',
      ),
      allowNull: false,
    },

    postId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'post_id',
      references: {
        model: 'posts',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    messageId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'message_id',
      references: {
        model: 'messages',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    content: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
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
    tableName: 'notifications',
    modelName: 'Notification',

    underscored: true,
    timestamps: true,

    indexes: [
      {
        fields: ['recipient_id', 'is_read'],
        name: 'notifications_recipient_read_idx',
      },
      {
        fields: ['recipient_id', 'created_at'],
        name: 'notifications_recipient_created_idx',
      },
    ],
  },
);

export default Notification;