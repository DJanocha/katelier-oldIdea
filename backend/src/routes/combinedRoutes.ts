import { Express, Request, Response, NextFunction } from 'express';
import { AppError } from 'src/utils';
import materialsRouter from 'src/routes/materialsRouter';
import stepsRouter from 'src/routes/stepsRouter';
import projectsRouter from 'src/routes/projectsRouter';
import usersRouter from 'src/routes/usersRouter';
import categoriesRouter from 'src/routes/categoriesRouter';
import activitiesRouter from 'src/routes/activitiesRouter';
import authRouter from 'src/routes/authRouter';

const unknownRouteHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Could not find ${req.originalUrl} route.`, 404));
};

export const useAllRoutesBy = (app: Express) => {
  app.use('/api/materials', materialsRouter);
  app.use('/api/steps', stepsRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/', authRouter);

  app.all('*', unknownRouteHandler);
};
