/*
  upload middleware used for handling image uploads. 
  It uses multer to parse the incoming request and validate the uploaded file. 
  The middleware checks for allowed image types and enforces a maximum file size limit. 
  If the upload is successful, it proceeds to the next middleware or controller; 
  otherwise, it returns an appropriate error response.
*/
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError } from "@utils/AppError";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_IMAGE_SIZE_MB,
} from "@modules/uploads/uploads.constants";

// Configure multer to handle single image uploads with validation
const parseSingleImage = multer({
  // Use memory storage to store the uploaded file in memory as a Buffer
  storage: multer.memoryStorage(),
  // Set limits for file size, number of files, and number of fields
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
    fields: 1,
  },
  // Validate the uploaded file type against the allowed image types
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return callback(new AppError(400, "Only image files are allowed"));
    }
    return callback(null, true);
  },
}).single("file");

export const uploadSingleImage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  parseSingleImage(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? `File size must be ${MAX_IMAGE_SIZE_MB}MB or less`
          : "Invalid image upload";
      return next(new AppError(400, message));
    }

    return next(error);
  });
};
