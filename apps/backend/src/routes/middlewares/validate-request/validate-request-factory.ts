import { IMiddleware } from '@/routes/middlewares';

import { ValidateRequestMiddleware } from '.';

export const makeValidateRequestMiddleware = (): IMiddleware => {
  return new ValidateRequestMiddleware();
};
