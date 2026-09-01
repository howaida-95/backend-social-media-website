import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@config/database';

class Message extends Model<
  InferAttributes<Message>,
  InferCreationAttributes<Message>
> {
  declare id: CreationOptional<number>;

  declare senderId: number;
  declare receiverId: number;

  declare text: string | null;
  declare imageUrl: string | null;
  declare uploadId: number | null;

  declare isRead: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'sender_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    receiverId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'receiver_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'image_url',
    },

    uploadId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'uploads',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      field: 'upload_id',
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
    tableName: 'messages',
    modelName: 'Message',

    underscored: true,
    timestamps: true,

    validate: {
      hasContent() {
        if (!this.text && !this.imageUrl && !this.uploadId) {
          throw new Error('Message must contain text or an image.');
        }
      },
    },

    indexes: [
      {
        fields: ['sender_id', 'receiver_id'],
        name: 'messages_sender_receiver_idx',
      },
      {
        fields: ['receiver_id', 'is_read'],
        name: 'messages_receiver_read_idx',
      },
      {
        unique: true,
        fields: ['upload_id'],
        name: 'messages_upload_id_unique',
      },
    ],
  },
);

export default Message;