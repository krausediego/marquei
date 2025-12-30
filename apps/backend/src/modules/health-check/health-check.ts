export interface IHealthCheck {
  run(params: HealthCheck.Params): Promise<HealthCheck.Response>;
}

export namespace HealthCheck {
  export type Params = {
    traceId: string;
    clientId?: number;
  };

  export type Response = boolean;
}
