import { RequestHandler } from 'express';
import { Model } from 'mongoose';
import { AppError, catchAsync, name } from 'src/utils';

export const stopParentFromHavingInvalidChildrens = ({
  parentModel,
  childrenModel
}: {
  parentModel: Model<any>;
  childrenModel: Model<any>;
}): RequestHandler =>
  catchAsync(async (req, res, next) => {
    const pluralName = name(childrenModel) + 's';
    const childrenArr = req.body[pluralName];
    if (!childrenArr) {
      return next();
    }
    if (!Array.isArray(childrenArr)) {
      return next();
    }
    if (childrenArr.length === 0) {
      return next();
    }

    const validIdsCount = await childrenModel.count({
      _id: {
        $in: childrenArr
      }
    });
    const allStepsAreInDatabase = validIdsCount === childrenArr.length;

    if (!allStepsAreInDatabase) {
      return next(
        new AppError(
          `cannot add non-existent ${name(childrenModel)} to ${name(
            parentModel
          )}`,
          404
        )
      );
    }
    return next();
  });
