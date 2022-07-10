import { Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser } from 'src/models';
import { hashTheResetToken } from 'src/utils/hashTheResetToken';
import { getRandomString } from 'src/utils/randomString';
import { AppError } from './AppError';
import { UserDocument } from 'src/models/users';
const trimTo10 = (numberToTrim: number) => Number(`${numberToTrim}`.slice(0, 10));
export const propertiesBlockedFromBeingModified = ['role'];
export interface JWTPayload extends jwt.JwtPayload {
  id: string;
  iat: number;
  exp: number;
}
type CookieOptionsType = {
  expiresIn: Date;
  httpOnly: boolean;
  secure?: boolean;
};

export type PasswordVariant = 'currentPassword' | 'newPassword' | 'newPasswordConfirm';
export interface UpdateUserPasswordInput extends Record<PasswordVariant, string> {
  email: string;
}
export const verifyAndDecodeJWT = (token: string, secret: jwt.Secret) => {
  const verified = jwt.verify(token, secret);
  if (!verified) {
    return null;
  }
  const decoded = jwt.decode(token);
  return decoded as JWTPayload;
};
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

export const createJWTandSendResponse = ({ user, res }: { user: UserDocument; res: Response }) => {
  const token = generateJWT(user._id);
  const expiresIn = Number(process.env.COOKIE_JWT_EXPIRES_IN);
  if (isNaN(expiresIn)) {
    throw new AppError('Wrong JWT expiration time', 500);
  }
  const cookieOptions: CookieOptionsType = {
    expiresIn: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);

  const userOutputData: Partial<IUser> = {
    categories: user.categories,
    email: user.email,
    facebook: user.facebook,
    image: user.image,
    name: user.name,
    ig: user.ig,
    role: user.role,
    tel: user.tel
  };
  return res.status(200).json({ ok: true, token, user: userOutputData });
};
export const requireUserLogin = async ({ token, secret }: { token?: string; secret?: string }) => {
  if (!token) {
    throw new AppError('You need to login first', 404);
  }
  if (!secret) {
    throw new AppError('Could not log in. Try again.', 500);
  }
  const decoded = verifyAndDecodeJWT(token, secret);

  if (!decoded) {
    throw new AppError('Could not log in. Try again.', 500);
  }
  const { exp, iat, id } = decoded;
  const foundUser = await User.findById<UserDocument>(id);

  if (!foundUser) {
    throw new AppError('User no longer exist. Log into different account', 403);
  }

  const tokenIsOutdated = isResetTokenOutdated({ passwordChangedAt: foundUser.passwordChangedAt, iat, exp });

  if (tokenIsOutdated) {
    throw new AppError('Token is outdated. Please, login again.', 401);
  }
  return foundUser;
};
export const resetUserPassword = async ({
  token,
  password,
  passwordConfirm
}: {
  token: string;
  password: string;
  passwordConfirm: string;
}) => {
  if (!token || !password || !passwordConfirm) {
    throw new AppError('Token invalid or outdated. You need new one.', 401);
  }
  const hashedToken = hashTheResetToken(token);

  const foundUser: UserDocument | null = await User.findOne({
    resetPassword: hashedToken,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  });
  if (!foundUser) {
    throw new AppError('Token invalid or outdated. You need new one.', 401);
  }

  foundUser.resetPassword = undefined;
  foundUser.resetPasswordExpires = undefined;

  foundUser.password = password;
  foundUser.passwordConfirm = passwordConfirm;

  await foundUser.save();
};

export const loginAs = async ({ email, password: pass }: { email: string; password: string }) => {
  if (!email || !pass) {
    throw new AppError('Please provide email and password', 400);
  }
  const user = (await User.findOne({ email }).select('+password')) as UserDocument;
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
}: UpdateUserPasswordInput) => {
  const user = await User.findOne<UserDocument>({ email }).select('+password');

  if (!user) {
    throw new AppError('Incorrect user or password. Try again later', 400);
  }

  const { password: hashedCurrentPassword } = user;
  const passwordOk = await bcrypt.compare(currentPassword, hashedCurrentPassword);
  if (!passwordOk) {
    throw new AppError('Incorrect user or password. Try again later', 400);
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();
  return user;
};

export const updateUserData = async ({ email, data }: { email: string; data: Record<string, string> }) => {
  if (data.newPassword || data.newPasswordConfirm) {
    throw new AppError('In order to update password. Visit /updatePassword', 401);
  }

  propertiesBlockedFromBeingModified.forEach((prop) => delete data[prop]);

  const updatedUser = await User.findOneAndUpdate<UserDocument>({ email }, data, { new: true, runValidators: true });

  if (!updatedUser) {
    throw new AppError('Incorrect user or password. Try again later', 400);
  }
  return updatedUser;
};
