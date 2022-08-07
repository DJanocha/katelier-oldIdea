import { RequestHandler } from 'express';
import { Project } from 'src/models';
import { catchAsync, generateHandlers } from 'src/utils';
import * as service from 'src/services/projectService';
import { Types } from 'mongoose';

const { deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Project
});

const createOne: RequestHandler = catchAsync(async (req, res, next) => {
  const { user, params, body } = req;
  const categoryId = new Types.ObjectId(params.categoryId);
  const newElement = await service.addProject({ userId: user?._id, categoryId, newProjectData: body });
  return res.status(200).json({ ok: true, data: newElement });
});

export { createOne, deleteOne, getAll, getOne, updateOne };
