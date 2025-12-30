export namespace Http {
  export interface IRequest<Data = any> {
    method: string;
    path: string;
    data: Data;
    locals?: any;
  }

  export interface IResponse {
    statusCode: number;
    code?: number;
    body?: any;
  }
}
