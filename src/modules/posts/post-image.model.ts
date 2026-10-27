import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "@config/database";

class PostImage extends Model<
  InferAttributes<PostImage>,
  InferCreationAttributes<PostImage>
> {
  declare id: CreationOptional<number>;
  declare postId: number;
  declare uploadId: number;
  declare position: number;
}

PostImage.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    postId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "posts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      field: "post_id",
    },

    uploadId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "uploads",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      field: "upload_id",
    },

    position: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "post_images",
    modelName: "PostImage",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ["post_id", "position"],
      },
      {
        unique: true,
        fields: ["upload_id"],
      },
    ],
  },
);

export default PostImage;
