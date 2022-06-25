import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { catchAsync } from 'src/utils';
import { User } from 'src/models';
export const addNameToRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  req.name = 'Daniel';
  next();
};

export const register: RequestHandler = catchAsync(async (req, res, next) => {
  const acceptedUserData = { ...req.body, role: undefined };

  const newUser = new User(acceptedUserData);
  await newUser.save();
  const token = jwt.sign(
    { id: newUser._id },
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );

  return res.json({ ok: true, data: newUser, token });
});
