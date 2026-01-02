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
    hasAuth: !!(options.headers as any)?.Authorization,
    endpoint
  })

  try {
    return await $fetch<T>(endpoint, options);
  } catch (err) {
    const status = (err as FetchError)?.response?.status ?? (err as any)?.status;
    if (status === 401) {
      if (!canRefresh(session)) throw err;
      console.warn('[ApiService] 401, attempting refresh')
      const refreshedToken = await getAccessToken(session, refreshSession, true);
      options.headers = withAuthHeaders(options.headers, refreshedToken);
      console.debug('[ApiService] headers after refresh', {
        hasAuth: !!(options.headers as any)?.Authorization,
        endpoint
      })
      return await $fetch<T>(endpoint, options);
    }
    throw err;
  }
};

export default ApiService;

async function getAccessToken(
  session: Ref<any>,
  refreshSession: () => Promise<void>,
  forceRefresh = false
): Promise<string | undefined> {
  let token = session.value?.user?.accessToken;
  let exp = session.value?.user?.accessExp;
  let expired = !!exp && exp <= Date.now();

  if (!token && !forceRefresh) {
    await refreshSession();
    token = session.value?.user?.accessToken;
    exp = session.value?.user?.accessExp;
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
      token = session.value?.user?.accessToken;
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

function canRefresh(session: Ref<any>): boolean {
  return !!session.value?.user;
}
