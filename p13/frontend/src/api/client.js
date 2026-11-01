const TOKEN_KEY = 'p13-task-app-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && !path.endsWith('/auth/login')) {
      window.dispatchEvent(new CustomEvent('task-auth-expired'));
    }

    throw new Error(
      payload?.message || `Request failed with status ${response.status}.`
    );
  }

  return payload;
}
