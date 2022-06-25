import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { AppError, catchAsync } from 'src/utils';
import { User, UserType } from 'src/models';
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
export const login: RequestHandler = catchAsync(async (req, res, next) => {
  const emailPasswordMessage = 'Email or password not correct.';
  const { email, password: candidatePassword } = req.body;
  if (!email || !candidatePassword) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new AppError(emailPasswordMessage, 400));
  }
  const { password } = user;

  const passwordOk = await bcrypt.compare(candidatePassword, password);

  if (!passwordOk) {
    return next(new AppError(emailPasswordMessage, 400));
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  return res.json({ ok: true, data: user, token });
});
