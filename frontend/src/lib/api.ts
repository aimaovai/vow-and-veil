import type { User, Wedding } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

function getCookie(name: string): string | null {
  return document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${name}=`))
    ?.split('=')[1] ?? null;
}

export async function ensureCsrfToken(): Promise<string> {
  const cookieToken = getCookie('XSRF-TOKEN');
  if (cookieToken) {
    return cookieToken;
  }

  const response = await fetch(`${API_BASE}/api/auth/csrf`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to fetch CSRF token');
  }

  const data = await response.json() as { token?: string };
  return data.token ?? getCookie('XSRF-TOKEN') ?? '';
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await ensureCsrfToken();
  const headers = new Headers(options.headers ?? {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-XSRF-TOKEN', token);

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload ? String((payload as { error?: string }).error) : 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}

export const api = {
  register: (payload: { firstName: string; lastName: string; email: string; password: string }) =>
    request<User>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<User>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  me: () => request<User>('/api/auth/me'),
  getCurrentWedding: () => request<Wedding | { exists: boolean }>('/api/weddings/current'),
  updateCurrentWedding: (payload: Partial<Wedding>) =>
    request<Wedding>('/api/weddings/current', { method: 'PUT', body: JSON.stringify(payload) }),
};
