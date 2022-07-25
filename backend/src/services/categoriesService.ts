import { Types } from 'mongoose';
import { Category, CategoryDocument } from 'src/models/categories';
import { AppError } from 'src/utils';

export const addProject = async (categoryId: Types.ObjectId, newProjectName: string) => {
  const category: CategoryDocument | null = await Category.findById<CategoryDocument>(categoryId);

  if (!category) {
    throw new AppError('could not find the category', 400);
  }

  return category.addProject(newProjectName);
};
