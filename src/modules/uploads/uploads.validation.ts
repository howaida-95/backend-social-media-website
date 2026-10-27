import { z } from 'zod';

export const uploadSchema = z.object({
  purpose: z.enum(['avatar', 'cover', 'post', 'story', 'message']).default('post'),
});
