import { $fetch, type FetchOptions, type FetchError } from 'ofetch';
import { useRuntimeConfig } from '#app';
import { useUserSession } from '#imports';
import type { Ref } from 'vue';

let refreshPromise: Promise<void> | null = null;

const ApiService = async <T>(endpoint: string, options: FetchOptions<'json'> = {}): Promise<T> => {

  const config = useRuntimeConfig();

  const { session, fetch: refreshSession } = useUserSession();

  options.baseURL = config.public.apiBase;

  const token = await getAccessToken(session, refreshSession);
  console.debug('[ApiService] token', {
    present: !!token
  })
  options.headers = withAuthHeaders(options.headers, token);
  console.debug('[ApiService] headers', {
    hasAuth: !!new Headers(options.headers).get('Authorization'),
    endpoint
  })

  try {
    return await $fetch<T>(endpoint, options);
  }
  catch (err) {
    const status = getErrorStatus(err);
    
    if (status === 401) {
      if (!canRefresh(session)) throw err;
      console.warn('[ApiService] 401, attempting refresh')
      const refreshedToken = await getAccessToken(session, refreshSession, true);
      options.headers = withAuthHeaders(options.headers, refreshedToken);
      console.debug('[ApiService] headers after refresh', {
        hasAuth: !!new Headers(options.headers).get('Authorization'),
        endpoint
      })
      return await $fetch<T>(endpoint, options);
    }
    throw err;
  }
};

export default ApiService;

async function getAccessToken(
  session: Ref<unknown>,
  refreshSession: () => Promise<void>,
  forceRefresh = false
): Promise<string | undefined> {
  let token = getSessionUser(session)?.accessToken;
  let exp = getSessionUser(session)?.accessExp;
  let expired = !!exp && exp <= Date.now();

  if (!token && !forceRefresh) {
    await refreshSession();
    token = getSessionUser(session)?.accessToken;
    exp = getSessionUser(session)?.accessExp;
    expired = !!exp && exp <= Date.now();
    console.debug('[ApiService] hydrated session', { present: !!token, expired })
  }

  if (forceRefresh || (!token || expired)) {
    if (canRefresh(session)) {
      console.debug('[ApiService] refreshing token')
      if (!refreshPromise) {
        refreshPromise = $fetch('/api/auth/refresh', { method: 'POST' })
          .then(() => refreshSession())
          .finally(() => { refreshPromise = null });
      }
      await refreshPromise;
      token = getSessionUser(session)?.accessToken;
      console.debug('[ApiService] refreshed token', { present: !!token })
    }
  }

  return token;
}

function withAuthHeaders(headers: HeadersInit | undefined, token?: string): HeadersInit {
  const out: HeadersInit = { ...(headers || {}) };

  if (token) {
    (out as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return out;
}

function canRefresh(session: Ref<unknown>): boolean {
  return !!getSessionUser(session);
}

function getSessionUser(session: Ref<unknown>): { accessToken?: string, accessExp?: number } | undefined {
  if (!session.value || typeof session.value !== 'object') return undefined;
  const maybe = session.value as { user?: unknown };
  if (!maybe.user || typeof maybe.user !== 'object') return undefined;
  const user = maybe.user as { accessToken?: unknown, accessExp?: unknown };
  return {
    accessToken: typeof user.accessToken === 'string' ? user.accessToken : undefined,
    accessExp: typeof user.accessExp === 'number' ? user.accessExp : undefined
  }
}

function getErrorStatus(err: unknown): number | undefined {
  const fetchError = err as FetchError | undefined
  const fromFetch = fetchError?.response?.status
  if (typeof fromFetch === 'number') return fromFetch

  if (err && typeof err === 'object') {
    const maybe = (err as { status?: unknown }).status
    if (typeof maybe === 'number') return maybe
  }

  return undefined
}
