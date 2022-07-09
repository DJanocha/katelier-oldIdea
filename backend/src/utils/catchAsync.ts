import { Request, Response, NextFunction } from 'express';

type CallbackType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<Response<unknown, Record<string, unknown>> | void>;

export const catchAsync = (callback: CallbackType) => (req: Request, res: Response, next: NextFunction) => {
  callback(req, res, next).catch(next);
};
