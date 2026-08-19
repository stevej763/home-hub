/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_SERVER: string;
  readonly VITE_API_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
