import { Types } from 'mongoose';
import { Activity, Project, Step } from 'src/models';
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
  userId: Types.ObjectId;
}) => {
  const project : ProjectDocument | null = await Project.findById(projectId);
  if(!project){
    throw new AppError('could not find project. try to add step again.',400)
  }
  const innerActivity = new Activity({ start_time, stop_time, date, description, userId });
  const step = new Step({ category: categoryId, project: projectId, step_number: project?.steps?.length || -1, img });
  innerActivity.step = step._id;
  step.activity = innerActivity._id;
  await step.save();
  await innerActivity.save();
  project.steps.push(step._id);
  await project.save()
};
