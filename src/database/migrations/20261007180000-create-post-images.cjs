"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("post_images", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      post_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "posts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      upload_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "uploads",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      position: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    });

    await queryInterface.addIndex("post_images", ["post_id", "position"], {
      name: "post_images_post_id_position_index",
    });
    await queryInterface.addIndex("post_images", ["upload_id"], {
      name: "post_images_upload_id_unique",
      unique: true,
    });

    await queryInterface.sequelize.query(
      "INSERT INTO post_images (post_id, upload_id, position) " +
        "SELECT id, upload_id, 0 FROM posts WHERE upload_id IS NOT NULL",
    );

    const foreignKeys =
      await queryInterface.getForeignKeyReferencesForTable("posts");
    for (const foreignKey of foreignKeys) {
      if (foreignKey.columnName === "upload_id") {
        await queryInterface.removeConstraint(
          "posts",
          foreignKey.constraintName,
        );
      }
    }
    await queryInterface.removeIndex("posts", "posts_upload_id_unique");
    await queryInterface.removeColumn("posts", "upload_id");
  },

  async down(queryInterface, Sequelize) {
    const [postsWithMultipleImages] = await queryInterface.sequelize.query(
      "SELECT post_id FROM post_images GROUP BY post_id HAVING COUNT(*) > 1 LIMIT 1",
    );
    if (postsWithMultipleImages.length > 0) {
      throw new Error(
        "Cannot roll back post_images while a post has multiple images",
      );
    }

    await queryInterface.addColumn("posts", "upload_id", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "uploads",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.sequelize.query(
      "UPDATE posts p JOIN (" +
        "SELECT post_id, MIN(upload_id) AS upload_id " +
        "FROM post_images GROUP BY post_id" +
        ") pi ON pi.post_id = p.id SET p.upload_id = pi.upload_id",
    );
    await queryInterface.addIndex("posts", ["upload_id"], {
      name: "posts_upload_id_unique",
      unique: true,
    });
    await queryInterface.dropTable("post_images");
  },
};
