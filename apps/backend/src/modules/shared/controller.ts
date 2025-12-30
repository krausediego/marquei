import { Http } from '@/infra';

export interface IController {
  handle: (request: Http.IRequest) => Promise<Http.IResponse>;
}
