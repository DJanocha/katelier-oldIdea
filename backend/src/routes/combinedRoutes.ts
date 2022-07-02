import { Express, Request, Response, NextFunction } from 'express';
import rateLimiter from 'express-rate-limit';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import xssClan from 'xss-clean';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
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

const limitRate = rateLimiter({
  max: 1000,
  windowMs: 3600 * 1000,
  message: 'Too many request for your IP. Try again in an hour.'
});

export const useAllRoutesBy = (app: Express) => {
  app.use(helmet());
  app.use(xssClan());
  app.use(ExpressMongoSanitize());
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  app.use('/api', limitRate);
  app.use('/api/materials', materialsRouter);
  app.use('/api/steps', stepsRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/activities', activitiesRouter);
  app.use('/', authRouter);

  app.all('*', unknownRouteHandler);
};
