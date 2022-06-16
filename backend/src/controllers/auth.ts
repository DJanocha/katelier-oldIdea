import { Request, Response, NextFunction } from 'express';

export const addNameToRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  req.name = 'Daniel';
  next();
};
