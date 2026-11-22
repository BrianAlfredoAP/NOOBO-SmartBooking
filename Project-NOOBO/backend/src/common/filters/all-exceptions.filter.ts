import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

const STATUS_CODE_TO_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  500: 'INTERNAL_ERROR',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Terjadi kesalahan pada server';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      code = STATUS_CODE_TO_CODE[status] ?? 'INTERNAL_ERROR';

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        if (typeof r.code === 'string') {
          code = r.code;
        }
        if (typeof r.message === 'string') {
          message = r.message;
        } else if (Array.isArray(r.message)) {
          errors = r.message as string[];
          message = 'Validasi gagal';
          code = 'VALIDATION_ERROR';
        }
        if (Array.isArray(r.errors)) {
          errors = r.errors as string[];
        }
      }
    } else {
      this.logUnhandled(exception);
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      ...(errors ? { errors } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private logUnhandled(exception: unknown): void {
    if (exception instanceof Error) {
      const code =
        'code' in exception
          ? ` (${String((exception as Error & { code?: string }).code)})`
          : '';
      this.logger.error(`${exception.message}${code}`, exception.stack);
      if (exception instanceof AggregateError) {
        for (const cause of exception.errors) {
          this.logger.error(`  caused by: ${String(cause)}`);
        }
      }
      return;
    }
    this.logger.error(`Unhandled exception: ${String(exception)}`);
  }
}
