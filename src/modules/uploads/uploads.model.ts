import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import { sequelize } from '@config/database';

export type UploadPurpose = 'avatar' | 'cover' | 'post' | 'story' | 'message';
export type UploadResourceType = 'image' | 'video';
export type UploadStatus = 'pending' | 'attached';

class Upload extends Model<
  InferAttributes<Upload>,
  InferCreationAttributes<Upload>
> {
  declare id: CreationOptional<number>;

  declare userId: number;

  declare url: string;
  declare publicId: string;

  declare originalName: string | null;
  declare mimeType: string;
  declare size: number;

  declare purpose: UploadPurpose;
  declare status: CreationOptional<UploadStatus>;
  declare resourceType: CreationOptional<UploadResourceType>;

  declare width: number | null;
  declare height: number | null;
  declare format: string | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

Upload.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    // Who uploaded this file? This creates a relationship: user & upload
    userId: {
      type: DataTypes.INTEGER.UNSIGNED, // means the value cannot be negative.
      allowNull: false, // means the value is required, Every upload must belong to a user.
/*
  This creates a foreign key.
  It tells MySQL:
  uploads.user_id must reference an existing users.id.
*/      
      references: {
        model: 'users', // references the users table
        key: 'id', // references the id column in the users table
      },
      onUpdate: 'CASCADE', // means if the user id is updated, the upload id will be updated
      onDelete: 'CASCADE', // means if the user is deleted, the upload will be deleted
      field: 'user_id', // means the column name in the database is user_id
    },

    // Where can I access the uploaded file?
    url: {
      type: DataTypes.STRING(500), // means the value can be up to 500 characters long.
      allowNull: false, // means the value is required, Every upload must have a URL.
      validate: {
        isUrl: true,// makes Sequelize validate that the value looks like a URL.
      },
    },
/* is useful for managing the file in the cloud storage.
For example, when you delete the image:
cloudinary.uploader.destroy(publicId)
*/
    publicId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      // because each uploaded resource should have its own storage identifier.
      unique: true,
      field: 'public_id',
      validate: {
        notEmpty: true,
      },
    },
// This is the filename the user originally uploaded.
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: true, // it's nullable because some upload systems may not provide an original filename.
      field: 'original_name',
    },
/*
This tells you what type of file it is.
Examples:
=========
image/jpeg
image/png
video/mp4
image/webp
It's also useful for validation.
For example, you can check if the file is an image or a video.
*/
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'mime_type',
      validate: {
        notEmpty: true,
      },
    },
/*
This is the size of the uploaded file, usually in bytes.
minimum = 1 byte
maximum = 10 MB
*/
    size: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      validate: {
        min: 1,
        max: 10 * 1024 * 1024,
      },
    },
/*
Why was this file uploaded?
For example:
avatar -> means profile picture.
cover -> means cover photo.
post -> means attached to a post.
story -> means attached to a story.
message -> means attached to a message.
This becomes very useful when querying:
*/
    purpose: {
      type: DataTypes.ENUM('avatar', 'cover', 'post', 'story', 'message'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'attached'),
      allowNull: false,
      defaultValue: 'pending',
    },
/*
Is the uploaded resource an image or video?
*/
    resourceType: {
      type: DataTypes.ENUM('image', 'video'),
      allowNull: false,
      defaultValue: 'image',
      field: 'resource_type',
    },

    width: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    height: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    format: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
/*
  - latest uploads
  - upload history
  - sorting
  - analytics
*/
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
    tableName: 'uploads',
    modelName: 'Upload',
    timestamps: true,
    underscored: true,
    paranoid: true,
/* 
These are database indexes.
Think of an index like the index at the back of a book.
Without an index, the database might need to inspect a huge number of rows.
*/
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['purpose'],
      },
      {
        fields: ['user_id', 'purpose'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['user_id', 'status'],
      },
      {
        unique: true,
        fields: ['public_id'],
      },
    ],
  },
);

export default Upload;
/*
note:
TypeScript code uses: camelCase
MySQL database uses: snake_case
Sequelize maps between them.
so we explicitly define the column names in the database.
field: 'user_id'
underscored: true -> means the column names in the database are snake_case. 

                    USERS
                      │
                      │ 1
                      │
                      │
                      │ many
                      ▼
                   UPLOADS
        ┌─────────────────────────────┐
        │ id                          │
        │ user_id                     │ ← Who uploaded it?
        │ url                         │ ← Where is the file?
        │ public_id                   │ ← Storage provider ID
        │ original_name               │ ← Original filename
        │ mime_type                   │ ← image/jpeg, video/mp4
        │ size                        │ ← File size
        │ purpose                     │ ← avatar/post/story/message (intent)
        │ status                      │ ← pending/attached
        │ resource_type               │ ← image/video
        │ width                       │ ← Dimensions
        │ height                      │
        │ format                      │ ← jpg/png/mp4
        │ created_at                  │
        │ updated_at                  │
        │ deleted_at                  │ ← Soft delete
        └─────────────────────────────┘

        Ownership lives on the parent:
        posts.upload_id · stories.upload_id · messages.upload_id
        users.avatar_upload_id · users.cover_upload_id
*/