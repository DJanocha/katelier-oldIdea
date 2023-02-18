import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordMismatchException extends HttpException {
  constructor() {
    super('Passwords are not identical', HttpStatus.NOT_ACCEPTABLE);
  }
}
