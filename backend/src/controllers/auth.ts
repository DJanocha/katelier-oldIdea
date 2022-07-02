import { promisify } from 'util';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError, catchAsync, isResetTokenOutdated } from 'src/utils';
import { User, UserType } from 'src/models';
import { sendEmail } from 'src/utils/emails';
import { loginAndSendResponse } from 'src/utils/authUtils';
import { hashTheResetToken } from 'src/utils/hashTheResetToken';

//routes
export const register: RequestHandler = catchAsync(async (req, res, next) => {
  const acceptedUserData = { ...req.body, role: undefined };

  const newUser = new User(acceptedUserData);
  await newUser.save();

  return loginAndSendResponse({ id: newUser._id, res });
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
  return loginAndSendResponse({ id: user._id, res });
});

export const resetPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  const hashedToken = hashTheResetToken(token);

  const foundUser = await User.findOne({
    resetPassword: hashedToken,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  });
  if (!foundUser) {
    return next(new AppError('Token invalid or outdated. You need new one.', 401));
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  foundUser.resetPassword = undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  foundUser.resetPasswordExpires = undefined;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  foundUser.password = password;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  foundUser.passwordConfirm = passwordConfirm;

  await foundUser.save();

  return res.status(200).json({ ok: true, token });
});

export const forgotPassword: RequestHandler = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Email for sending reset password token is required!', 401));
  }
  const foundUser: typeof User | null = await User.findOne({ email });

  if (!foundUser) {
    return next(new AppError('Could not find a user with given email', 200));
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const generatedToken = foundUser.createResetPasswordToken();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    foundUser.resetPasswordToken = undefined;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    foundUser.resetPasswordExpires = undefined;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    await foundUser.save({ validateBeforeSave: false }); // so that it doesn't require us to put passwordConfirm on the User document

    return next(new AppError('Could not send email to the user. Try again later', 500));
  }

  return res.status(200).json({ ready: false, generatedToken, foundUser, email, text, resetTokenUrl });
});

export const updatePassword: RequestHandler = catchAsync(
  async (req: Request & { user?: UserType | undefined }, res, next) => {
    const { user, body } = req;

    if (!user) {
      return next(new AppError('You need to login!', 401));
    }
    const { email } = user;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const userWithPassword = await User.findOne({ email }).select('+password');

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { password: hashedCurrentPassword } = userWithPassword;
    const { currentPassword: candidateCurrentPassword, newPassword, newPasswordConfirm } = body;

    const passwordOk = await bcrypt.compare(candidateCurrentPassword, hashedCurrentPassword);
    if (!passwordOk) {
      return next(new AppError('Incorrect password. Try again later', 400));
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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return loginAndSendResponse({ id: user._id, res });
  }
);

export const updateMe: RequestHandler = catchAsync(
  async (req: Request & { user?: UserType | undefined }, res, next) => {
    const { body, user } = req;

    const { newPassword, newPasswordConfirm } = body;

    if (newPassword || newPasswordConfirm) {
      return next(new AppError('In order to update password. Visit /updatePassword', 401));
    }
    const propertiesBlockedFromBeingModified = ['role'];

    propertiesBlockedFromBeingModified.forEach((prop) => delete body[prop]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const updatedUser = await User.findByIdAndUpdate(user._id, body, { new: true, runValidators: true });

    return res.status(200).json({ ok: true, user: updatedUser });
  }
);
export const me: RequestHandler = (req: Request & { user?: UserType | undefined }, res, next) => {
  const { user } = req;
  if (!user) {
    return next(new AppError('You need to login!', 401));
  }
  res.status(200).json({ ok: true, user });
};

export const deleteMe: RequestHandler = catchAsync(
  async (req: Request & { user?: UserType | undefined }, res, next) => {
    const { user } = req;
    if (!user) {
      return next(new AppError('You need to login!', 401));
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    await User.findByIdAndUpdate(user._id, { active: false }, { new: true }).select('+active');

    res.status(204).json({});
  }
);

//middleware

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

    const tokenIsOutdated = isResetTokenOutdated({ passwordChangedAt: foundUser.passwordChangedAt, iat, exp });

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
