import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { AppError } from '@utils/AppError';
import { env } from '@config/env';
import uploadsRepository from '@modules/uploads/uploads.repository';
import type { UploadPurpose, UploadedFile } from '@modules/uploads/uploads.types';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_IMAGE_SIZE_MB,
} from '@modules/uploads/uploads.constants';

export const saveUploadedImage = async (
  file: UploadedFile,
  userId: number,
  purpose: UploadPurpose = 'post',
) => {
  if (!file) {
    throw new AppError(400, 'No file uploaded');
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    throw new AppError(400, 'Only image files are allowed');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new AppError(400, `File size must be ${MAX_IMAGE_SIZE_MB}MB or less`);
  }

  // Create the uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  // Ensure the directory exists, creating it if necessary
  await fs.mkdir(uploadDir, { recursive: true });

  // extension will be the file extension of the uploaded file, e.g., '.jpg', '.png', etc.
  const extension = path.extname(file.originalname) || '.png';
  // Use the current timestamp and a random UUID to create a unique filename
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
 // Create the full file path for the uploaded file
  const filePath = path.join(uploadDir, fileName);

  // Write the uploaded file buffer to the specified file path
  await fs.writeFile(filePath, file.buffer);

  // Construct the public URL for accessing the uploaded file 
  const url = `${env.backendPublicUrl}/uploads/${fileName}`;

  // Persist upload metadata through the repository
  const upload = await uploadsRepository.create({
    userId,
    url,
    publicId: fileName,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    purpose,
    status: 'attached',
    resourceType: 'image',
    format: file.mimetype.split('/')[1] ?? 'png',
  });

  return upload;
};
