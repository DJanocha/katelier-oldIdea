import { Types } from "mongoose";
import {Project, ProjectDocument } from 'src/models/projects';
import { Category, CategoryDocument } from "src/models/categories";
import { User, UserDocument } from "src/models/users";
import { AppError } from "src/utils";

export const countAllProjects = async () => Project.find().count()

export const addProject = async (userId: Types.ObjectId, categoryId: Types.ObjectId, newProjectName: string) => {
  const category: CategoryDocument | null = await Category.findById<CategoryDocument>(categoryId);
  const user: UserDocument | null = await User.findById<UserDocument>(userId);

  if (!category || !user) {
    throw new AppError('could not find the category or user', 400);
  }

  return category.addProject(newProjectName);
};

export const removeProject = async (projectId: Types.ObjectId) => {
  const project: ProjectDocument | null = await Project.findById(projectId);
  if (!project) {
    throw new AppError('could not find the category', 400);
  }
  if (project.steps.length > 0) {
    throw new AppError('cannot remove project that is not empty', 400);
  }
  return project.remove();
};
