type Config = {
    objectType: 'interface' | 'type';
    typePath: string;
    apiPath: string;
};
export declare const getConfig: () => Config;
export {};
