import { apiRequest } from './client.js';

async function request(path, options) {
  return apiRequest(path, options);
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
