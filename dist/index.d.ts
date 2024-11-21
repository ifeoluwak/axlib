type FunctionType<T> = (...args: any[]) => Promise<T>;
type ObjectType<T> = {
    [key in keyof T]: FunctionType<T[key]>;
};
declare const typedApiWrapper: <T>(obj: ObjectType<T>) => ObjectType<T>;
export { typedApiWrapper };
