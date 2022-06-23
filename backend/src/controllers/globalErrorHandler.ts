import { ErrorRequestHandler, Response } from 'express';
import { AppError } from 'src/utils';

const sendDevError = (err: AppError, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};
const sendProdError = (err: AppError, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong. Try again later'
    });
  }
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  console.log({ err });
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'prod') {
    return sendProdError(err, res);
  }
  return sendDevError(err, res);
};
