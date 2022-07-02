import { Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserType } from 'src/models';
import { hashTheResetToken } from 'src/utils/hashTheResetToken';
import { getRandomString } from 'src/utils/randomString';
import { AppError } from './AppError';
const trimTo10 = (numberToTrim: number) => Number(`${numberToTrim}`.slice(0, 10));
export const propertiesBlockedFromBeingModified = ['role'];
export const isResetTokenOutdated = ({
  passwordChangedAt,
  iat,
  exp
}: {
  passwordChangedAt: any;
  iat: number;
  exp: number;
}): boolean => {
  if (!passwordChangedAt && !iat && !exp) {
    return false;
  }
  const now = trimTo10(Date.now());
  if (exp < now) {
    return true;
  }

  const changedAt = trimTo10(passwordChangedAt?.getTime());
  if (changedAt && changedAt > iat) {
    return true;
  }
  if (exp < now) {
    return true;
  }

  return false;
};

export const generateResetToken = () => {
  const token = getRandomString(20);
  const hashed = hashTheResetToken(token);
  const expiresIn = Date.now() + 10 * 60 * 1000; // now + 10 minutes

  return { hashed, expiresIn, token };
};

export const generateJWT = (id: Types.ObjectId) =>
  jwt.sign({ id }, process.env.JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

type CookieOptionsType = {
  expiresIn: Date;
  httpOnly: boolean;
  secure?: boolean;
};

export const loginAndSendResponse = ({ user, res }: { user: UserType; res: Response }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const token = generateJWT(user._id);
  const cookieOptions: CookieOptionsType = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    expiresIn: new Date(Date.now() + process.env.COOKIE_JWT_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  user.password = undefined;

  return res.status(200).json({ ok: true, token, user });
};

export const loginAs = async ({ email, pass }: { email: string; pass: string }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Incorrect email or password', 400);
  }
  const { password } = user;
  const passwordOk = await bcrypt.compare(pass, password);

  if (!passwordOk) {
    throw new AppError('Incorrect email or password', 400);
  }
  return user;
};

export const updateUserPassword = async ({
  currentPassword,
  email,
  newPassword,
  newPasswordConfirm
}: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  email: string;
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const user = await User.findOne({ email }).select('+password');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { password: hashedCurrentPassword } = user;
  const passwordOk = await bcrypt.compare(currentPassword, hashedCurrentPassword);
  if (!passwordOk) {
    throw new AppError('Incorrect password. Try again later', 400);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  user.password = newPassword;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  user.passwordConfirm = newPasswordConfirm;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await user.save();
  return user;
};

export const updateUserData = async ({ email, data }: { email: string; data: Record<string, string> }) => {
  if (data.newPassword || data.newPasswordConfirm) {
    throw new AppError('In order to update password. Visit /updatePassword', 401);
  }

  propertiesBlockedFromBeingModified.forEach((prop) => delete data[prop]);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const updatedUser = await User.findOneAndUpdate({ email }, data, { new: true, runValidators: true });

  return updatedUser;
};
