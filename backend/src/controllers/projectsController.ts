import { RequestHandler } from 'express';
import { Project } from 'src/models';
import { catchAsync, generateHandlers } from 'src/utils';
import * as service from 'src/services/projectService';
import { Types } from 'mongoose';

const {  getOne, updateOne } = generateHandlers({
  model: Project
});

const deleteOne: RequestHandler = catchAsync(async (req, res, next) => {
  const { params } = req;
  const categoryId = new Types.ObjectId(params.categoryId);
  const projectId = new Types.ObjectId(params.id);
  const newElement = await service.removeProject({categoryId, projectId})
  return res.status(200).json({ ok: true, data: newElement });
});


const createOne: RequestHandler = catchAsync(async (req, res, next) => {
  const { user, params, body } = req;
  const categoryId = new Types.ObjectId(params.categoryId);
  const newElement = await service.addProject({ userId: user?._id, categoryId, newProjectData: body });
  return res.status(200).json({ ok: true, data: newElement });
});

const getAll: RequestHandler = catchAsync(async (req, res, next) => {
  const categoryId = new Types.ObjectId(req.params.categoryId);
  const elements = await service.getProjects(categoryId );
  return res.status(200).json({ ok: true, data: elements });
});

export { createOne, deleteOne, getAll, getOne, updateOne };
