/// <reference types="react-scripts" />
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        WISHNEST_API_BASE_URL: string;
        WISHNEST_FRONT_URL: string;
    }
}