import { NextFunction, Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from './AppError';
import { catchAsync } from './catchAsync';

type HandlerKey = 'getAll' | 'getOne' | 'deleteOne' | 'updateOne' | 'createOne';
type RequestHandlerGenerator = (arg0: {
  model: mongoose.Model<any>;
}) => Record<HandlerKey, RequestHandler>;

const name = (model: mongoose.Model<any>) =>
  model.modelName.toLocaleLowerCase();

// export const generateHandlers: RequestHandlerGenerator = ({ model }) => ({
export const generateHandlers = ({
  model
}: {
  model: mongoose.Model<unknown>;
}): Record<HandlerKey, RequestHandler> => ({
  getAll: catchAsync(async (req, res, next) => {
    const elements = await model.find();
    return res
      .status(500)
      .json({ role: 'get all items', ready: false, elements });
  }),
  createOne: catchAsync(async (req, res, next) => {
    const newElement = await model.create({ ...req.body });
    return res
      .status(200)
      .json({ role: 'get all items', ready: false, newElement });
  }),
  getOne: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const one = await model.findById(id);
    if (one === null) {
      return next(new AppError(`Could not find a/an ${name(model)}`, 404));
    }
    return res
      .status(200)
      .json({ role: 'get single item', ready: false, id, one });
  }),
  updateOne: catchAsync(async (req, res, next) => {
    const { params, body } = req;
    const id = Number(params.id);
    await model.findByIdAndUpdate(id, { ...req.body });

    return res.status(200).json({
      message: `updating single ${name(model)} NOT IMPLEMENTED YET!!`,
      body
    });
  }),
  deleteOne: catchAsync(async (req, res, next) => {
    const { params } = req;
    const id = Number(params.id);
    model.findByIdAndDelete(id);
    return res.status(200).json({
      message: `deleting single ${name(model)} NOT IMPLEMENTED YET!!`,
      params
    });
  })
});
