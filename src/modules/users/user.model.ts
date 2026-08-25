/*
Defines the database representation.

For example:
User
Post
Comment
Message
Story
*/

import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@config/database.ts';

class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;

  declare firstName: string;
  declare lastName: string;

  declare username: string;
  declare email: string;
  declare password: string;

  declare avatar: string | null;
  declare bio: string | null;

  declare role: CreationOptional<'user' | 'admin'>;

  declare isActive: CreationOptional<boolean>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
    },

    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
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
    tableName: 'users',

    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['username'],
      },
    ],
  }
);

export default User;