export const FMS_CONFIG_OPTIONS = 'FMS_CONFIG_OPTIONS';

export interface FmsClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  debug?: boolean;
}

export const DEFAULT_FMS_CLIENT_OPTIONS: FmsClientOptions = {
  baseUrl: process.env.FMS_BASE_URL || process.env.FMS_CONTROLLER_URL || 'http://localhost/api',
  timeoutMs: Number(process.env.FMS_TIMEOUT_MS ?? 15000),
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  debug: process.env.NODE_ENV === 'development',
};
