import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
import { sequelize } from '@config/database';

class RefreshToken extends Model<
  InferAttributes<RefreshToken>,
  InferCreationAttributes<RefreshToken>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare tokenHash: string;
  declare expiresAt: Date;
  declare revokedAt: Date | null;
  declare replacedByTokenHash: string | null;
  declare userAgent: string | null;
  declare ipAddress: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    // The hash of the refresh token
    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: 'token_hash',
    },
    // The expiration date of the refresh token
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
    },
    // The date and time the refresh token was revoked
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'revoked_at',
    },
    // The hash of the token that replaced the revoked token
    replacedByTokenHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'replaced_by_token_hash',
    },
    // The user agent of the device that the refresh token was used on
    userAgent: {
      type: DataTypes.STRING(512),
      allowNull: true,
      field: 'user_agent',
    },
    // The ip address of the device that the refresh token was used on
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    // The date and time the refresh token was created
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    // The date and time the refresh token was updated
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    modelName: 'RefreshToken',
    timestamps: true,
    underscored: true,
  },
);

export default RefreshToken;
