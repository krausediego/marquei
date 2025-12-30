import { AnyObjectSchema } from 'yup';

export namespace ValidateMiddleware {
  export interface IData {
    body: Record<string, any>;
    params: any;
    query: Record<string, any>;
    schema: AnyObjectSchema;
  }
}
