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

import { sequelize } from '@config/database';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
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
  declare deletedAt: CreationOptional<Date | null>;
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
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
    },

    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        isAlphanumeric: true,
      },
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
      // Note: Always hash passwords before storing (bcrypt, argon2, etc.)
      // Never store plain text passwords
    },

    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
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

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at',
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    underscored: true,
    paranoid: true,
    /*
    index is a database optimization that makes searching/filtering data faster.
    Think of it like the index at the back of a book.
    Without an index:

    Find user where email = "test@gmail.com"

    MySQL:
    User 1 → check
    User 2 → check
    User 3 → check
    ...
    User 1,000,000 → check

    Potentially scan many rows

    With an index on email:

    email index
         ↓
    "test@gmail.com"
         ↓
    User #58291

    MySQL can find the row much more efficiently.
    */
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        unique: true,
        fields: ['username'],
      },
      {
        fields: ['is_active'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default User;