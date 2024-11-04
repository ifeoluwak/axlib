type FunctionType<T> = (...args: any[]) => Promise<{
    data: T;
}>;
type ObjectType<T> = {
    [key in keyof T]: FunctionType<T[key]>;
};
export declare const typedApiWrapper: <T>(obj: ObjectType<T>) => ObjectType<T>;
export declare const typedApi: <T>(fn: FunctionType<T>) => (args: any) => Promise<any>;
export {};
