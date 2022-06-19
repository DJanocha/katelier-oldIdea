import { Express, Request, Response, NextFunction } from 'express';
import achievementRouter from './achievementsRouter';
import materialsRouter from './materialsRouter';
import stepsRouter from './stepsRouter';
import projectsRouter from './projectsRouter';
import { AppError } from '../utils/AppError';

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
  app.use('/api/projects', projectsRouter);

  app.all('*', unknownRouteHandler);
};
