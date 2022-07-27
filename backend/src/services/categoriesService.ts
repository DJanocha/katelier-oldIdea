import { Types } from 'mongoose'
import { UserDocument, User } from 'src/models/users';
import { Category } from 'src/models/categories';
import { AppError } from 'src/utils';

export const countAllCategoies = async () => {
  const count = await Category.find().count();
  return count;
};
export const addCategory = async (userId: Types.ObjectId, newCategoryName: string) => {
  const user: UserDocument | null = await User.findById<UserDocument>(userId);
  if (!user) {
    throw new AppError('Incorrect user', 400);
  }

  return user.addCategory(newCategoryName);
};
