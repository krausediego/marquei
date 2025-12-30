import { Http } from '@/infra';

export interface IMiddleware {
  handle: (request: Http.IRequest) => Promise<Http.IResponse>;
}
