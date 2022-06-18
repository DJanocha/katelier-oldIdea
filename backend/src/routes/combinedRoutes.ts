import { Express, Request, Response, NextFunction } from 'express';
import achievementRouter from './achievementsRouter';
import materialsRouter from './materialsRouter';
import { AppError } from '../utils/AppError';
import stepsRouter from './stepsRouter';

const unknownRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new AppError(`Could not find ${req.originalUrl} route.`, 404));
};

export const useAllRoutesBy = (app: Express) => {
  app.use('/api/achievements', achievementRouter);
  app.use('/api/materials', materialsRouter);
  app.use('/api/steps', stepsRouter);

  app.all('*', unknownRouteHandler);
};
