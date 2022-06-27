import { promisify } from 'util';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { AppError, catchAsync, isTokenOutdated } from 'src/utils';
import { User, UserType } from 'src/models';

export const register: RequestHandler = catchAsync(async (req, res, next) => {
  const acceptedUserData = { ...req.body, role: undefined };

  const newUser = new User(acceptedUserData);
  await newUser.save();
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

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

export const requireLogin: RequestHandler = catchAsync(
  async (req: Request & { user?: UserType | undefined }, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ').pop();
    }
    if (!token) {
      return next(new AppError('You need to login first', 404));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const decoded: { id: string; iat: number; exp: number } = await promisify(jwt.verify)(
      token,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      process.env.JWT_SECRET
    );

    const { exp, iat, id } = decoded;
    const foundUser = await User.findById(id);

    if (!foundUser) {
      return next(new AppError('User no longer exist. Log into different account', 403));
    }

    const tokenIsOutdated = isTokenOutdated({ passwordChangedAt: foundUser.passwordChangedAt, iat, exp });

    if (tokenIsOutdated) {
      return next(new AppError('Token is outdated. Please, login again.', 401));
    }
    req.user = foundUser;

    next();
  }
);
export const requireArtist: RequestHandler = (req: Request & { user?: UserType | undefined }, res, next) => {
  const isArtist = req.user?.role === 'artist';
  if (!isArtist) {
    return next(new AppError('You need to be an artist here to see that page.', 401));
  }
  next();
};
