import { Types } from 'mongoose';
import { UserDocument, User } from 'src/models/users';
import { Category, CategoryDocument, ICategory } from 'src/models/categories';
import { AppError } from 'src/utils';
import { Step } from 'src/models';

export const countAllCategories = async () => {
  const count = await Category.find().count();
  return count;
};

export const getUsersCategories = async (userId: Types.ObjectId) => {
  const userWithCategoriesPopulated = await User.findById(userId).populate('categories');
  return userWithCategoriesPopulated?.categories || [];
};

export const addCategory = async ({ userId, newCategoryName }: { userId: Types.ObjectId; newCategoryName: string }) => {
  const user: UserDocument | null = await User.findById<UserDocument>(userId);
  if (!user || user.role !== 'artist') {
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

type CategoryMutation = Partial<Pick<ICategory, 'name' | 'description' | 'color' | 'icon'>> & {
  categoryId: Types.ObjectId;
};

export const updateCategory = async ({ categoryId, ...data }: CategoryMutation) =>
  Category.findByIdAndUpdate(categoryId, data);

export const getCategory = async (id: string) => Category.findById(new Types.ObjectId(id));
