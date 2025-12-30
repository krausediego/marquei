/**
 * Pass traceId to this.traceId of the class service.
 * @param target The prototype of the class the method belongs to.
 * @param propertyKey The name of the method being decorated.
 * @param descriptor The property descriptor for the method.
 * @returns descriptor
 */
export const setTraceId = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;

  descriptor.value = async function handle(...args: any[]) {
    const params = args[0];

    if (params?.traceId) {
      if (this && typeof this === 'object' && 'traceId' in this) {
        this.traceId = params.traceId;
      }
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
};
