import { Types } from 'mongoose';
import {
  IProject,
  Project,
  ProjectDocument,
  ProjectDocumentsWithSteps,
  ProjectDocumentsWithStepsAndLastStepImg
} from 'src/models/projects';
import { Category, CategoryDocument } from 'src/models/categories';
import { User, UserDocument } from 'src/models/users';
import { AppError, getLastItem } from 'src/utils';
import { StepDocument } from 'src/models/steps';

export const countAllProjects = async () => Project.find().count();

export const getAllProjects = async (categoryId: Types.ObjectId) => {
  const category: CategoryDocument | null = await Category.findById(categoryId);
  if (!category) {
    throw new AppError('could not find the category', 400);
  }
  return category.projects;
};

export const addProject = async ({
  userId,
  categoryId,
  newProjectData
}: {
  userId: Types.ObjectId | undefined;
  categoryId: Types.ObjectId;
  newProjectData: Partial<Pick<IProject, 'name' | 'description'>>;
}) => {
  if (!userId) {
    throw new AppError('could not find the category or user', 400);
  }

  const category: CategoryDocument | null = await Category.findById<CategoryDocument>(categoryId);
  const user: UserDocument | null = await User.findById<UserDocument>(userId);

  if (!category || !user) {
    throw new AppError('could not find the category or user', 400);
  }

  return category.addProject(newProjectData);
};

const getProjectLastStepImg = (project: ProjectDocumentsWithSteps): ProjectDocumentsWithStepsAndLastStepImg=>{
  const lastStep = getLastItem<StepDocument>(project.steps);
  const lastStepImg = lastStep?.img;
  return { ...project, lastStepImg } as ProjectDocumentsWithStepsAndLastStepImg;
}

export const getProjects = async (categoryId: Types.ObjectId) => {
  const projects: ProjectDocumentsWithSteps[] = await Project.find({category: categoryId}).populate({
    path: 'steps',
    select: '-_id img'
  });
  if (!projects || !projects.length ) {
    return [];
  }
  return projects.map(getProjectLastStepImg);
};

type ProjectMutation = Partial<Pick<IProject, 'name' | 'description' | 'client_info'>> & { projectId: Types.ObjectId };

export const updateProject = async ({ projectId, ...data }: ProjectMutation) =>
  Project.findByIdAndUpdate(projectId, data);

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
