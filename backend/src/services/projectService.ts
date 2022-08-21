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

export const getProjects = async (categoryId: Types.ObjectId) =>
  Project.aggregate()
    .match({ category: categoryId })
    .addFields({ last_step_id: { $last: '$steps' } })
    /*
    that below read as:
    From all documents in table called "steps"
    find all the documents that have "_id" field
    equal to "last_field_id" in current documents.
    Every matching document save to 'last_step_as_arr' array
    
    */
    .lookup({
      from: 'steps',
      foreignField: '_id',
      localField: 'last_step_id',
      as: 'last_step_as_arr'
    })
    .addFields({
      last_step_item: { $last: '$last_step_as_arr' }
    })
    .addFields({
      last_step_img: '$last_step_item.img'
    })
    .project({
      last_step_id: 0,
      last_step_as_arr: 0,
      last_step_item: 0
    })
    .exec();
type ProjectMutation = Partial<Pick<IProject, 'name' | 'description' | 'client_info'>> & { projectId: Types.ObjectId };

export const updateProject = async ({ projectId, ...data }: ProjectMutation) =>
  Project.findByIdAndUpdate(projectId, data);

export const removeProject = async ({
  projectId,
  categoryId
}: {
  projectId: Types.ObjectId;
  categoryId: Types.ObjectId;
}) => {
  const project: ProjectDocument | null = await Project.findOne({ _id: projectId, category: categoryId });
  if (!project) {
    throw new AppError('could not find the project', 400);
  }
  if (project.steps.length > 0) {
    throw new AppError('cannot remove project that is not empty', 400);
  }
  return project.remove();
};
