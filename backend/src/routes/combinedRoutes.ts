import { Express } from 'express';
import achievementRouter from './achievementsRouter';

export const useAllRoutesBy = (app: Express) => {
  app.use('/api/achievements', achievementRouter);
  console.log('app should be using all the routers from now on');
};
