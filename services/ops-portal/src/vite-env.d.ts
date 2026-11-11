/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_KEY?: string;
  readonly VITE_DEFAULT_TIMEZONE?: string;
  readonly VITE_ENGINE_HEALTH_URL?: string;
  readonly VITE_EMS_SIM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

