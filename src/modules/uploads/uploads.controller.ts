import { Request, Response } from 'express';
import { AppError } from '@utils/AppError';
import { saveUploadedImage } from '@modules/uploads/uploads.service';
import type { UploadPurpose } from '@modules/uploads/uploads.types';

const ALLOWED_PURPOSES: UploadPurpose[] = [
  'avatar',
  'cover',
  'post',
  'story',
  'message',
];

const uploadsController = {
  uploadImage: async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized');
    }

    if (!req.file) {
      throw new AppError(400, 'No file uploaded');
    }

    const rawPurpose = (req.body.purpose as string | undefined) || 'post';
    const purpose =
      ALLOWED_PURPOSES.find((allowedPurpose) => allowedPurpose === rawPurpose) ??
      'post';

    const upload = await saveUploadedImage(
      {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
      },
      req.user.id,
      purpose,
    );

    return res.status(201).json({
      success: true,
      data: {
        id: upload.id,
        url: upload.url,
        purpose: upload.purpose,
        uploadId: upload.id,
      },
    });
  },
};

export default uploadsController;
