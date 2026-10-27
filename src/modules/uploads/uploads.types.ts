export type UploadPurpose = 'avatar' | 'cover' | 'post' | 'story' | 'message';
export type UploadResourceType = 'image' | 'video';
export type UploadStatus = 'pending' | 'attached';

export type UploadedFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};
