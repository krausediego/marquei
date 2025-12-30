import { AnyObjectSchema } from 'yup';

import { adaptMiddleware } from '@/routes/handlers';

import { makeValidateRequestMiddleware } from '.';

export const validateRequest = (schema: AnyObjectSchema) =>
  adaptMiddleware(makeValidateRequestMiddleware(), schema);
