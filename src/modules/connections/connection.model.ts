import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@config/database';

class Connection extends Model<InferAttributes<Connection>,InferCreationAttributes<Connection>> {
  declare id: CreationOptional<number>;

  declare followerId: number;
  declare followingId: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Connection.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    followerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'follower_id',
    },

    followingId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'following_id',
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
    tableName: 'connections',
    modelName: 'Connection',
    timestamps: true,
    underscored: true,

    indexes: [
      {
        unique: true,
        fields: ['follower_id', 'following_id'],
      },
    ],
  }
);

export default Connection;