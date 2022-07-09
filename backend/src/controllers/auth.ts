import { Request, RequestHandler } from 'express';
import { AppError, catchAsync, isResetTokenOutdated } from 'src/utils';
import { User, IUser } from 'src/models';
import { sendEmail } from 'src/utils/emails';
import {
  loginAndSendResponse,
  loginAs,
  updateUserPassword,
  updateUserData,
  verifyAndDecodeJWT
} from 'src/utils/authUtils';
import { hashTheResetToken } from 'src/utils/hashTheResetToken';
import { IBaseUser, UserDocument } from 'src/models/users';

//routes
export const register: RequestHandler = catchAsync(async (req, res, next) => {
  const acceptedUserData = { ...req.body, role: undefined } as IBaseUser;

  const newUser = new User(acceptedUserData) as UserDocument;
  await newUser.save();

  return loginAndSendResponse({ user: newUser, res });
});
export const login: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password: pass } = req.body;
  if (!email || !pass) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await loginAs({ email, pass });
  return loginAndSendResponse({ user, res });
});

export const resetPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  const hashedToken = hashTheResetToken(token);

  const foundUser: UserDocument | null = await User.findOne({
    resetPassword: hashedToken,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  });
  if (!foundUser) {
    return next(new AppError('Token invalid or outdated. You need new one.', 401));
  }

  foundUser.resetPassword = undefined;
  foundUser.resetPasswordExpires = undefined;

  foundUser.password = password;
  foundUser.passwordConfirm = passwordConfirm;

  await foundUser.save();

  return res.status(200).json({ ok: true, token });
});

export const forgotPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Email for sending reset password token is required!', 401));
  }
  const foundUser: UserDocument | null = await User.findOne({ email });

  if (!foundUser) {
    return next(new AppError('Could not find a user with given email', 200));
  }
  foundUser;

  const generatedToken = foundUser.createResetPasswordToken();

  await foundUser.save({ validateBeforeSave: false }); // so that it doesn't require us to put passwordConfirm on the User document
  const resetTokenUrl = `${req.protocol}://api/v1/reset_password/${generatedToken}`;
  const text = `If you forgot your password, send PATCH request with your new password to ${resetTokenUrl}, othwerwise ignore that email whatsoever.`;

  try {
    await sendEmail({
      from: 'nadawca@nadawca.nadawca',
      subject: 'resetujemy haslo:)',
      text,
      to: email
    });
  } catch (error) {
    foundUser.resetPassword = undefined;
    foundUser.resetPasswordExpires = undefined;
    await foundUser.save({ validateBeforeSave: false }); // so that it doesn't require us to put passwordConfirm on the User document

    return next(new AppError('Could not send email to the user. Try again later', 500));
  }

  return res.status(200).json({ ready: false, generatedToken, foundUser, email, text, resetTokenUrl });
});

export const updatePassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { user, body } = req;

  if (!user) {
    return next(new AppError('You need to login!', 401));
  }
  const { email } = user;

  const { currentPassword, newPassword, newPasswordConfirm } = body;

  const updatedUser = await updateUserPassword({ currentPassword, email, newPassword, newPasswordConfirm });
  return loginAndSendResponse({ user: updatedUser, res });
});

export const updateMe: RequestHandler = catchAsync(async (req, res, next) => {
  const { body, user } = req;

  const { email } = user as { email: string | undefined };

  if (!user || !email) {
    return next(new AppError('You need to login!', 401));
  }
  const updatedUser = await updateUserData({ email, data: body });

  return res.status(200).json({ ok: true, user: updatedUser });
});
export const me: RequestHandler = (req: Request & { user?: IUser | undefined }, res, next) => {
  const { user } = req;
  if (!user) {
    return next(new AppError('You need to login!', 401));
  }
  res.status(200).json({ ok: true, user });
};

export const deleteMe: RequestHandler = catchAsync(async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return next(new AppError('You need to login!', 401));
  }
  await User.findByIdAndUpdate(user._id, { active: false }, { new: true }).select('+active');

  res.status(204).json({});
});

//middleware

export const requireLogin: RequestHandler = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ').pop();
  }
  if (!token) {
    return next(new AppError('You need to login first', 404));
  }
  const secret = process.env.JWT_SECRET;
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
    return next(new AppError('User no longer exist. Log into different account', 403));
  }

  const tokenIsOutdated = isResetTokenOutdated({ passwordChangedAt: foundUser.passwordChangedAt, iat, exp });

  if (tokenIsOutdated) {
    return next(new AppError('Token is outdated. Please, login again.', 401));
  }
  req.user = foundUser;

  next();
});
export const requireArtist: RequestHandler = (req: Request & { user?: IUser | undefined }, res, next) => {
  const isArtist = req.user?.role === 'artist';
  if (!isArtist) {
    return next(new AppError('You need to be an artist here to see that page.', 401));
  }
  next();
};
