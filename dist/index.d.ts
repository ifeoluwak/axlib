type FunctionType<T, U extends Parameters<any>> = (...args: U) => Promise<T>;
type ObjectType<T, U extends Parameters<any>> = {
    [key in keyof T]: FunctionType<T[key], U>;
};
export declare const typedApiWrapper: <T, U extends Parameters<any>>(obj: ObjectType<T, U>) => ObjectType<T, U>;
export declare const typedApi: <T, U extends Parameters<any>>(fn: FunctionType<T, U>) => (...args: U) => Promise<any>;
export {};
