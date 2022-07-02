import { ErrorRequestHandler, Response } from 'express';
import { AppError } from 'src/utils';
const handleJWTError = () =>
  new AppError('Failed to login. Please try again later.', 401);
const handleJWTExpiredError = () =>
  new AppError('Session expired. Please try again later.', 401);

const sendDevError = (err: AppError, res: Response) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};
const sendProdError = (err: AppError, res: Response) => {
  if (!err.isOperational) {
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
  const originalError = { ...err };
  console.log({ err, originalError });
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV !== 'prod') {
    return sendDevError(err, res);
  }
  let error = { ...err };
  if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
  return sendProdError(error, res);
};
