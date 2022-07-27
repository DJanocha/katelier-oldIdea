import { Types } from 'mongoose';
import { UserDocument, User } from 'src/models/users';
import { Category, CategoryDocument } from 'src/models/categories';
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

export const removeCategory = async (categoryId: Types.ObjectId) => {
  const category: CategoryDocument | null = await Category.findById(categoryId);
  if (!category) {
    throw new AppError('Incorrect category name', 400);
  }
  if (category.projects.length > 0) {
    throw new AppError('Cannot remove category that is not empty', 400);
  }

  return category.remove();
};