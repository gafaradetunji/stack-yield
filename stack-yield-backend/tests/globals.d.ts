/// <reference types="jest" />
/// <reference types="node" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toThrow(expected?: string | RegExp | jest.Constructable): R;
      rejects: Matchers<Promise<R>>;
    }
  }
}
