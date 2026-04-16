/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY: string;
  readonly CONTACT_EMAIL: string;
  readonly TS_QUERY_HOST: string;
  readonly TS_QUERY_PORT: string;
  readonly TS_QUERY_USER: string;
  readonly TS_QUERY_PASS: string;
  readonly TS_SERVER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
