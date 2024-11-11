type FunctionType<T, U> = (...args: U[]) => Promise<T>;
type ObjectType<T, U> = {
    [key in keyof T]: FunctionType<T[key], U>;
};
export declare const typedApiWrapper: <T, U>(obj: ObjectType<T, U>) => ObjectType<T, U>;
export declare const typedApi: <T, U>(fn: FunctionType<T, U>) => (args: U) => Promise<any>;
export {};
