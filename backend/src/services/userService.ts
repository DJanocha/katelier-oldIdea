import { Types } from 'mongoose';
import { User } from 'src/models';
import { UserDocument } from 'src/models/users';
import { AppError } from 'src/utils';

export const addCategory = async (userId: Types.ObjectId, newCategoryName: string) => {
  const user: UserDocument | null = await User.findById<UserDocument>(userId);
  if (!user) {
    throw new AppError('Incorrect user', 400);
  }

  return user.addCategory(newCategoryName);
};
