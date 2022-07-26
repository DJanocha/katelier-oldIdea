import { Types } from 'mongoose';
import { Category, CategoryDocument } from 'src/models/categories';
import { User, UserDocument } from 'src/models/users';
import { AppError } from 'src/utils';

export const countAllCategoies = async () => {
  const count = await Category.find().count();
  return count;
};

export const addProject = async (userId: Types.ObjectId, categoryId: Types.ObjectId, newProjectName: string) => {
  const category: CategoryDocument | null = await Category.findById<CategoryDocument>(categoryId);
  const user: UserDocument | null = await User.findById<UserDocument>(userId);

  if (!category || !user) {
    throw new AppError('could not find the category or user', 400);
  }

  return category.addProject(newProjectName);
};
