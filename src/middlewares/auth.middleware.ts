import { NextFunction, Request, Response } from 'express';
import User from '@modules/users/user.model';
import { COOKIE_NAME, verifyToken } from '@utils/jwt';
import { AppError } from '@utils/AppError';

/*
  authenticate is a middleware function that is used to authenticate the user.
  It is used to check if the user is authenticated and if the user is authenticated, 
  it sets the user in the request object.
  It is used to check if the user is authenticated and if the user is authenticated, 
  it sets the user in the request object.

  flow:
Try Authorization: Bearer <token>
If missing, fall back to the httpOnly cookie

Browser: cookie only — don’t put the JWT in JS or send Bearer from the SPA
Postman/mobile: Bearer is OK
Middleware accepting both = flexibility, not a hole, as long as the SPA doesn’t reintroduce token storage in JS

*/
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    // get the token from the header or the cookie
    const header = req.headers.authorization;
    const bearerToken =
      header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    // check if the token is in the header or the cookie
    const token = bearerToken || req.cookies?.[COOKIE_NAME];

    if (!token) {
      throw new AppError(401, 'Unauthorized');
    }

    // verify the token
    const decoded = verifyToken(token);
    // check if the user is authenticated
    if (!decoded.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    // find the user by the user id
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError(401, 'Unauthorized');
    }

    // set the user in the request object
    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError(401, 'Unauthorized'));
  }
};
