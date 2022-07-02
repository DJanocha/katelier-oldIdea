import { RequestHandlerer } from 'express';
declare module 'xss-clean' {
  const value: () => RequestHandlerer;

  export default value;
}
