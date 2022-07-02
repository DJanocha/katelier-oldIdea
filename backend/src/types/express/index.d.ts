import { UserType } from 'src/models';

declare global {
  namespace Express {
    interface Request {
      user?: UserType | undefined;
    }
  }
}
declare module 'express-serve-static-core' {
  export interface Request {
    user: UserType | undefined;
  }
}
