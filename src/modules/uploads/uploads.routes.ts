import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { uploadSingleImage } from "@middlewares/upload.middleware";
import uploadsController from "@modules/uploads/uploads.controller";

const uploadRoutes = Router();

uploadRoutes.post(
  "/image",
  authenticate,
  uploadSingleImage,
  uploadsController.uploadImage,
);

export default uploadRoutes;