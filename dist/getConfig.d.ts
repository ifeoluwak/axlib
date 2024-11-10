export type Config = {
    objectType: 'interface' | 'type';
    fetchType: 'fetch' | 'axios';
    typePath: string;
    apiPath: string;
};
export declare const getConfig: () => Config;
