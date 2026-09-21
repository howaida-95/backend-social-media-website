import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

/*
  validateBody is a middleware function that is used to validate the body of the request.
  It is used to validate the body of the request using the zod schema.
  It is used to validate the body of the request using the zod schema.
*/
export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    return next();
  };
};
