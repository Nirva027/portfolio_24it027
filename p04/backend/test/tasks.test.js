import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import app, { resetTasks } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  resetTasks();
});

test('GET /tasks returns the in-memory task list', async () => {
  const response = await fetch(`${baseUrl}/tasks`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), []);
});

test('POST /tasks creates a task and GET /tasks/:id reads it', async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '  Learn Express  ', description: 'Build a REST API' }),
  });

  assert.equal(createResponse.status, 201);
  const createdTask = await createResponse.json();
  assert.equal(createdTask.id, 1);
  assert.equal(createdTask.title, 'Learn Express');
  assert.equal(createdTask.description, 'Build a REST API');
  assert.equal(createdTask.completed, false);
  assert.ok(createdTask.createdAt);

  const readResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`);
  assert.equal(readResponse.status, 200);
  assert.deepEqual(await readResponse.json(), createdTask);
});

test('POST /tasks returns structured validation errors for an empty title', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '   ' }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Bad Request',
    message: 'Title is required and must be a non-empty string.',
  });
});

test('PUT /tasks/:id updates a task', async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Original task' }),
  });
  const createdTask = await createResponse.json();

  const updateResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Updated task',
      description: 'Revised description',
      completed: true,
    }),
  });

  assert.equal(updateResponse.status, 200);
  assert.deepEqual(await updateResponse.json(), {
    ...createdTask,
    title: 'Updated task',
    description: 'Revised description',
    completed: true,
  });
});

test('DELETE /tasks/:id deletes a task and later reads return 404', async () => {
  const createResponse = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Task to delete' }),
  });
  const createdTask = await createResponse.json();

  const deleteResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
    method: 'DELETE',
  });
  assert.equal(deleteResponse.status, 200);
  assert.equal((await deleteResponse.json()).task.id, createdTask.id);

  const readResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`);
  assert.equal(readResponse.status, 404);
  assert.deepEqual(await readResponse.json(), {
    error: 'Not Found',
    message: `Task with ID ${createdTask.id} was not found.`,
  });
});

test('unknown routes return a structured 404 response', async () => {
  const response = await fetch(`${baseUrl}/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: 'Not Found',
    message: 'Route GET /missing was not found.',
  });
});

test('malformed JSON returns a structured 400 response', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"title":',
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Bad Request',
    message: 'Request body must contain valid JSON.',
  });
});
