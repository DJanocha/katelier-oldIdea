import { UserDocument } from 'src/models/users';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument | undefined;
    }
  }
}
//https://stackoverflow.com/questions/45194598/using-process-env-in-typescript

declare module 'express-serve-static-core' {
  export interface Request {
    user?: UserDocument | undefined;
  }
}
