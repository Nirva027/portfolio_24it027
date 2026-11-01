async function request(path, options) {
  const response = await fetch(path, {
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.message || `Request failed with status ${response.status}.`
    );
  }

  return payload;
}

export function getTasks({ signal } = {}) {
  return request('/api/tasks', { signal });
}

export function createTask(task) {
  return request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export function updateTask(id, changes) {
  return request(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export function deleteTask(id) {
  return request(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
