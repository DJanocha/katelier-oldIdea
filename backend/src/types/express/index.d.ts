import { IUser } from 'src/models';

declare global {
  namespace Express {
    interface Request {
      user?: IUser | undefined;
    }
  }
}
declare module 'express-serve-static-core' {
  export interface Request {
    user: IUser | undefined;
  }
}
