import { Types } from 'mongoose';
import { Activity, IActivity, IStep, Project, Step } from 'src/models';
import { ProjectDocument } from 'src/models/projects';
import { AppError } from 'src/utils';
export const addStep = async ({
  categoryId,
  date,
  projectId,
  start_time,
  stop_time,
  img,
  description,
  userId
}: {
  categoryId: Types.ObjectId;
  projectId: Types.ObjectId;
  start_time: Date;
  stop_time: Date;
  date: Date;
  img?: string;
  description?: string;
  // userId: Types.ObjectId;
  userId: string | Types.ObjectId | undefined;
}) => {
  const project: ProjectDocument | null = await Project.findById(projectId);
  if (!project) {
    throw new AppError('could not find project. try to add step again.', 400);
  }
  const innerActivity = new Activity({ start_time, stop_time, date, description, userId });
  const step = new Step({ category: categoryId, project: projectId, step_number: project?.steps?.length || -1, img });
  innerActivity.step = step._id;
  step.activity = innerActivity._id;
  await step.save();
  await innerActivity.save();
  project.steps.push(step._id);
  await project.save();
  return project;
};

type StepMutation = Pick<IActivity, 'date' | 'start_time' | 'stop_time' | 'description'> &
  Pick<IStep, 'img' | 'used_materials'> & {
    stepId: string,
    categoryId: string,
    projectId: string
  };

export const updateStep = async ({ stepId, categoryId, projectId, ...data }: StepMutation) =>
  Step.findOneAndUpdate(
    {
      _id: new Types.ObjectId(stepId),
      category: new Types.ObjectId(categoryId),
      project: new Types.ObjectId(projectId)
    },
    data
  );

// export const deleteStep = async (stepId: Types.ObjectId) => Step.findByIdAndDelete(stepId);
export const deleteStep = async ({
  categoryId,
  projectId,
  stepId
}: {
  stepId: string;
  categoryId: string;
  projectId: string;
}) => {
  await Project.findOneAndUpdate(
    { _id: new Types.ObjectId(projectId) },
    { $pull: { steps: new Types.ObjectId(stepId) } }
  );
  await Step.findByIdAndDelete(stepId);
};

export const getStep = async ({
  stepId,
  projectId,
  categoryId
}: {
  stepId: string;
  categoryId: string;
  projectId: string;
}) =>
  Step.findOne({
    category: new Types.ObjectId(categoryId),
    project: new Types.ObjectId(projectId),
    _id: new Types.ObjectId(stepId)
});

export const getAllSteps = async (id: string) => {
  const projectId = new Types.ObjectId(id);
  const project: ProjectDocument | null = await Project.findById(projectId);
  if (!project) {
    throw new AppError('could not find the project', 400);
  }
  return project.steps;
};
