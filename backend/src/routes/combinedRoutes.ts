import { Express, Request, Response, NextFunction } from 'express';
import materialsRouter from './materialsRouter';
import stepsRouter from './stepsRouter';
import projectsRouter from './projectsRouter';
import clientsRouter from './clientsRouter';
import categoriesRouter from './categoriesRouter';
import activitiesRouter from './activitiesRouter';
import { AppError } from '../utils/AppError';

const unknownRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new AppError(`Could not find ${req.originalUrl} route.`, 404));
};

export const useAllRoutesBy = (app: Express) => {
  app.use('/api/materials', materialsRouter);
  app.use('/api/steps', stepsRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/clients', clientsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/activities', activitiesRouter);
  // app.get('/', (req, res) => {
  //   res.send('<html><head></head><body><h1>SIEMANKO</h1></body></html>');
  // });

  app.all('*', unknownRouteHandler);
};
