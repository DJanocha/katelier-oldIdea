import { RequestHandler } from 'express';
import { Category } from 'src/models';
import { catchAsync, generateHandlers } from 'src/utils';
import { Types } from 'mongoose'
import * as service from 'src/services/categoriesService';

const { createOne, getOne, updateOne } = generateHandlers({
  model: Category
});

const addCategory: RequestHandler = catchAsync(async (req, res, next) => {
  const { user, body } = req;
  const newCategory = await service.addCategory({ userId: user?._id, newCategoryName: body.newCategoryName });
  return res.status(200).json({ ok: true, data: { newCategory } });
});

const getAll: RequestHandler = catchAsync(async (req, res, next) => {
  const { user } = req;
  const categories = await service.getUsersCategories( user?._id);
  return res.status(200).json({ ok: true, data: { categories } });
});

const deleteOne: RequestHandler = catchAsync(async (req, res, next) => {
  const { params } = req;
  const { id } = params
  
  await service.removeCategory(new Types.ObjectId(id));
  return res.status(200).json({ ok: true });
});

export { addCategory, createOne, deleteOne, getAll, getOne, updateOne };