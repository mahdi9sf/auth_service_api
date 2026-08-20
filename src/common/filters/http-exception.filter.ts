import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exception.message;
    let errors: unknown = undefined;

    if (typeof exceptionResponse === 'object') {
      const body = exceptionResponse as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(body.message)) {
        message = 'Validation failed';
        errors = body.message;
      } else if (body.message) {
        message = body.message;
      }
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
      errors,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
