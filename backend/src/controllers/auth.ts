import { Request, RequestHandler } from 'express';
import { AppError, catchAsync } from 'src/utils';
import { User, IUser } from 'src/models';
import { sendEmail } from 'src/utils/emails';
import { createJWTandSendResponse, requireUserLogin } from 'src/utils/authUtils';
import { IBaseUser, UserDocument } from 'src/models/users';
import { resetUserPassword, updateUserPassword, updateUserData, loginAs } from 'src/services/authService';

//routes
export const register: RequestHandler = catchAsync(async (req, res, next) => {
  const acceptedUserData = { ...req.body, role: undefined } as IBaseUser;

  const newUser = new User(acceptedUserData) as UserDocument;
  await newUser.save();

  return createJWTandSendResponse({ user: newUser, res });
});
export const login: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await loginAs({ email, password });
  return createJWTandSendResponse({ user, res });
});

export const resetPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  await resetUserPassword({ token, password, passwordConfirm });

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

  const generatedToken = foundUser.createResetPasswordToken();

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
    foundUser.removeResetPasswordToken();
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
  return createJWTandSendResponse({ user: updatedUser, res });
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
  const secret = process.env.JWT_SECRET;

  req.user = await requireUserLogin({ token, secret });

  next();
});
export const requireArtist: RequestHandler = (req: Request & { user?: IUser | undefined }, res, next) => {
  const isArtist = req.user?.role === 'artist';
  if (!isArtist) {
    return next(new AppError('You need to be an artist here to see that page.', 401));
  }
  next();
};
