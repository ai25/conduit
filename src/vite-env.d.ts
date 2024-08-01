/// <reference types="vinxi/client"

interface ImportMetaEnv {
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  MANIFEST: {};
  ROUTER_NAME: string;
  ROUTER_TYPE: string;
  ROUTER_HANDLER: string;
  CWD: string;
  SERVER_BASE_URL: string;
  ROUTERS: string[];
  DEVTOOLS: boolean;
  START_ISLANDS: boolean;
  START_SSR: boolean;
  START_DEV_OVERLAY: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
