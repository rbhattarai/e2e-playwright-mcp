import { test as base, expect, APIRequestContext, APIResponse } from '@playwright/test';

type AuthFixture = {
  token: string;
  headers: Record<string, string>;
};

type ApiRequestOptions = {
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  auth?: boolean;
};

type ApiFixture = {
  baseURL: string;
  get: (path: string, options?: Omit<ApiRequestOptions, 'auth'>) => Promise<APIResponse>;
  post: (path: string, options?: ApiRequestOptions) => Promise<APIResponse>;
  put: (path: string, options?: ApiRequestOptions) => Promise<APIResponse>;
  del: (path: string, options?: ApiRequestOptions) => Promise<APIResponse>;
};

type DbFixture = {
  health: () => Promise<APIResponse>;
  reset: () => Promise<APIResponse>;
  seed: (payload: unknown) => Promise<APIResponse>;
};

type SeedConfigFixture = {
  ready: boolean;
  reason?: string;
  apiBaseUrl: string;
};

type SeedFixtures = {
  seedConfig: SeedConfigFixture;
  auth: AuthFixture;
  api: ApiFixture;
  db: DbFixture;
};

const getEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }
  return value.trim();
};

const normalizePath = (path: string): string => {
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path : `/${path}`;
};

const buildUrl = (baseURL: string, path: string): string => {
  return `${baseURL.replace(/\/$/, '')}${normalizePath(path)}`;
};

const createAuthHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

const createAuthedRequest = async (
  request: APIRequestContext,
  auth: AuthFixture,
  baseURL: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options: ApiRequestOptions = {}
): Promise<APIResponse> => {
  const headers = {
    ...(options.auth === false ? {} : auth.headers),
    ...(options.headers ?? {}),
  };

  return request.fetch(buildUrl(baseURL, path), {
    method,
    params: options.params,
    data: options.data,
    headers,
  });
};

export const test = base.extend<SeedFixtures>({
  seedConfig: async ({ baseURL }, use) => {
    const apiBaseUrl = getEnv('API_BASE_URL') ?? baseURL ?? '';
    const authToken = getEnv('AUTH_TOKEN');
    const authUsername = getEnv('AUTH_USERNAME');
    const authPassword = getEnv('AUTH_PASSWORD');

    if (!apiBaseUrl) {
      await use({
        ready: false,
        reason: 'Missing API endpoint: set API_BASE_URL (or Playwright use.baseURL).',
        apiBaseUrl,
      });
      return;
    }

    if (!authToken && !(authUsername && authPassword)) {
      await use({
        ready: false,
        reason:
          'Missing auth credentials: set AUTH_TOKEN, or set AUTH_USERNAME + AUTH_PASSWORD for login.',
        apiBaseUrl,
      });
      return;
    }

    await use({ ready: true, apiBaseUrl });
  },

  auth: async ({ request, seedConfig }, use) => {
    if (!seedConfig.ready) {
      await use({ token: '', headers: {} });
      return;
    }

    const envToken = getEnv('AUTH_TOKEN');
    if (envToken) {
      await use({ token: envToken, headers: createAuthHeaders(envToken) });
      return;
    }

    const loginPath = getEnv('AUTH_LOGIN_PATH') ?? '/auth/login';
    const username = getEnv('AUTH_USERNAME') ?? '';
    const password = getEnv('AUTH_PASSWORD') ?? '';

    const loginResponse = await request.post(buildUrl(seedConfig.apiBaseUrl, loginPath), {
      data: { username, password },
    });
    expect(loginResponse.ok(), `Auth login failed at ${loginPath}`).toBeTruthy();

    const payload = (await loginResponse.json()) as { token?: string; accessToken?: string };
    const token = payload.token ?? payload.accessToken;

    expect(token, 'Login response did not include token or accessToken').toBeTruthy();

    await use({ token: token!, headers: createAuthHeaders(token!) });
  },

  api: async ({ request, auth, seedConfig }, use) => {
    const base = seedConfig.apiBaseUrl;

    const api: ApiFixture = {
      baseURL: base,
      get: (path, options = {}) =>
        createAuthedRequest(request, auth, base, 'GET', path, { ...options, auth: options.auth ?? true }),
      post: (path, options = {}) =>
        createAuthedRequest(request, auth, base, 'POST', path, { ...options, auth: options.auth ?? true }),
      put: (path, options = {}) =>
        createAuthedRequest(request, auth, base, 'PUT', path, { ...options, auth: options.auth ?? true }),
      del: (path, options = {}) =>
        createAuthedRequest(request, auth, base, 'DELETE', path, { ...options, auth: options.auth ?? true }),
    };

    await use(api);
  },

  db: async ({ api }, use) => {
    const healthPath = getEnv('DB_HEALTH_PATH') ?? '/test/db/health';
    const resetPath = getEnv('DB_RESET_PATH') ?? '/test/db/reset';
    const seedPath = getEnv('DB_SEED_PATH') ?? '/test/db/seed';

    const db: DbFixture = {
      health: () => api.get(healthPath),
      reset: () => api.post(resetPath),
      seed: (payload: unknown) => api.post(seedPath, { data: payload }),
    };

    await use(db);
  },
});

export { expect };