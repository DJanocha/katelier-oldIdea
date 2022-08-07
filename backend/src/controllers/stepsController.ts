import { Step } from 'src/models';
import { catchAsync, generateHandlers } from 'src/utils';
import * as service from 'src/services/stepService';
import { RequestHandler } from 'express';
const { deleteOne, getOne, updateOne } = generateHandlers({
  model: Step
});

const getAll: RequestHandler = catchAsync(async (req, res, next) => {
  const allElements = await service.getAllSteps(req.params.projectId);
  return res.status(200).json({
    ok: true,
    data: allElements
  });
});

const createOne: RequestHandler = catchAsync(async (req, res, next) => {
  const { user, params } = req;
  const { categoryId, projectId } = params;
  const projectWithNewStep = await service.addStep({ categoryId, projectId, userId: user?._id, ...req.body });

  return res.status(200).json({
    ok: true,
    data: projectWithNewStep
  });
});
export { getAll, createOne, getOne, updateOne, deleteOne };
