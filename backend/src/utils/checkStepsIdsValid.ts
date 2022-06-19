import { RequestHandler } from 'express';
import Step from '../models/steps';
import { AppError } from './AppError';
import { catchAsync } from './catchAsync';

export const checkStepsValid: RequestHandler = catchAsync(
  async (req, res, next) => {
    const { steps } = req.body || [];
    if (!steps) {
      return next();
    }
    if (!Array.isArray(steps)) {
      return next();
    }
    if (steps.length === 0) {
      return next();
    }

    const validIdsCount = await Step.count({
      _id: {
        $in: steps
      }
    });
    const allStepsAreInDatabase = validIdsCount === steps.length;
    console.log({
      //   allStepsAreInDatabase,
      validIdsCount,
      stepsCount: steps.length
    });

    if (!allStepsAreInDatabase) {
      return next(new AppError('cannot add non-existent step to project', 404));
    }
    return next();
  }
);
