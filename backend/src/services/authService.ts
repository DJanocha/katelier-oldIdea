import { User } from 'src/models';
import { AppError } from 'src/utils';
import bcrypt from 'bcryptjs';
import { hashTheResetToken } from 'src/utils/hashTheResetToken';
import { UserDocument } from 'src/models/users';

type RegisterInput = {
  email: string;
  password: string;
  passwordConfirm: string;
};

export type PasswordVariant = 'currentPassword' | 'newPassword' | 'newPasswordConfirm';
export interface UpdateUserPasswordInput extends Record<PasswordVariant, string> {
  email: string;
}

export const propertiesBlockedFromBeingModified = ['role'];

export const register = async ({ email, password, passwordConfirm }: RegisterInput) => {
  const newUser = new User({ email, password, passwordConfirm });
  return newUser.save();
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
