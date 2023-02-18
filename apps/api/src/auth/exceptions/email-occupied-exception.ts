import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseSchemaHost } from '@nestjs/swagger';

const message = 'Email already taken';
const statusCode = HttpStatus.CONFLICT;

export class EmailOccupiedException extends HttpException {
  constructor() {
    super(message, statusCode);
  }
}

export const EmailOccupiedExceptionApiResponseSchema: ApiResponseSchemaHost['schema'] =
  {
    example: { statusCode, message },
    description: message,
  };
