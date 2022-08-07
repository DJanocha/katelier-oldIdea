import { RequestHandler } from 'express';
import { Category } from 'src/models';
import { catchAsync, generateHandlers } from 'src/utils';
import * as service from 'src/services/categoriesService';

const { createOne, deleteOne, getAll, getOne, updateOne } = generateHandlers({
  model: Category
});

const addCategory: RequestHandler = catchAsync(async (req, res, next) => {
  const { user, body } = req;
  const newCategory = await service.addCategory({ userId: user?._id, newCategoryName: body.newCategoryName });
  return res.status(200).json({ ok: true, data: { newCategory } });
});

export { addCategory, createOne, deleteOne, getAll, getOne, updateOne };
