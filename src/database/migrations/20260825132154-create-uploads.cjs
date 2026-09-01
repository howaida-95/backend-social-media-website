'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('uploads', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },

      public_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },

      original_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      size: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      purpose: {
        type: Sequelize.ENUM('avatar', 'cover', 'post', 'story', 'message'),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM('pending', 'attached'),
        allowNull: false,
        defaultValue: 'pending',
      },

      resource_type: {
        type: Sequelize.ENUM('image', 'video'),
        allowNull: false,
        defaultValue: 'image',
      },

      width: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      height: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      format: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('uploads', ['user_id'], {
      name: 'uploads_user_id_index',
    });

    await queryInterface.addIndex('uploads', ['purpose'], {
      name: 'uploads_purpose_index',
    });

    await queryInterface.addIndex('uploads', ['user_id', 'purpose'], {
      name: 'uploads_user_id_purpose_index',
    });

    await queryInterface.addIndex('uploads', ['status'], {
      name: 'uploads_status_index',
    });

    await queryInterface.addIndex('uploads', ['user_id', 'status'], {
      name: 'uploads_user_id_status_index',
    });

    await queryInterface.addIndex('uploads', ['public_id'], {
      unique: true,
      name: 'uploads_public_id_unique',
    });

    await queryInterface.addConstraint('users', {
      fields: ['avatar_upload_id'],
      type: 'foreign key',
      name: 'users_avatar_upload_id_fk',
      references: {
        table: 'uploads',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('users', {
      fields: ['cover_upload_id'],
      type: 'foreign key',
      name: 'users_cover_upload_id_fk',
      references: {
        table: 'uploads',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('users', ['avatar_upload_id'], {
      name: 'users_avatar_upload_id_unique',
      unique: true,
    });

    await queryInterface.addIndex('users', ['cover_upload_id'], {
      name: 'users_cover_upload_id_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('users', 'users_cover_upload_id_fk');
    await queryInterface.removeConstraint('users', 'users_avatar_upload_id_fk');
    await queryInterface.removeIndex('users', 'users_cover_upload_id_unique');
    await queryInterface.removeIndex('users', 'users_avatar_upload_id_unique');
    await queryInterface.dropTable('uploads');

    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_uploads_purpose";',
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_uploads_resource_type";',
      );
      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS "enum_uploads_status";',
      );
    }
  },
};
