import { HttpException, HttpStatus } from '@nestjs/common';

export interface BusinessExceptionResponse {
  code: string;
  message: string;
  errors?: string[];
}

export class BusinessException extends HttpException {
  readonly code: string;

  constructor(
    code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    errors?: string[],
  ) {
    super({ code, message, errors }, status);
    this.code = code;
  }
}
