import { getHttpError, ok, Http, BadRequestError } from '@/infra';
import { IMiddleware } from '@/routes/middlewares';

import { ValidateMiddleware } from '.';

export class ValidateRequestMiddleware implements IMiddleware {
  async handle(request: Http.IRequest<ValidateMiddleware.IData>) {
    const { body, params, query, schema } = request.data;

    try {
      await schema.validate(
        {
          body,
          params,
          query,
        },
        { abortEarly: false }
      );

      return ok({ validated: true });
    } catch (error: any) {
      return getHttpError(new BadRequestError(error.errors));
    }
  }
}
