import { Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserType } from 'src/models';
import { hashTheResetToken } from 'src/utils/hashTheResetToken';
import { getRandomString } from 'src/utils/randomString';
const trimTo10 = (numberToTrim: number) => Number(`${numberToTrim}`.slice(0, 10));
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
