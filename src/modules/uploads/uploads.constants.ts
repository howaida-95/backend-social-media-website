export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_IMAGE_SIZE_MB = MAX_IMAGE_SIZE / (1024 * 1024);

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
