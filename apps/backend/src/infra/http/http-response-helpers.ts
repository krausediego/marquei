import { ForbiddenError, BadRequestError, NotFoundError, InternalServerError, Http } from '.';

type errorTypes = BadRequestError | NotFoundError | ForbiddenError | InternalServerError;

export const ok = (data: Record<string, any>): Http.IResponse => ({
  statusCode: 200,
  body: data,
});

export const created = (data: Record<string, any>): Http.IResponse => ({
  statusCode: 201,
  body: data,
});

export const noContent = (): Http.IResponse => ({
  statusCode: 204,
});

export const getHttpError = (error: errorTypes): Http.IResponse => ({
  statusCode: error.statusCode || 500,
  code: error?.code,
  body: error,
});
