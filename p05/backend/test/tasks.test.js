import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import app from '../src/app.js';
import Task from '../src/models/Task.js';

const mongoUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI;
const databaseTests = { skip: !mongoUri ? 'Set TEST_MONGO_URI or MONGO_URI to run MongoDB integration tests.' : false };

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  if (mongoUri) {
    await mongoose.connect(mongoUri);
  }
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

test('Task schema supplies completed, description, and createdAt defaults', () => {
  const task = new Task({ title: 'Schema defaults' });
  assert.equal(task.completed, false);
  assert.equal(task.description, '');
  assert.ok(task.createdAt instanceof Date);
});

test('POST /tasks rejects a missing title with structured JSON', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'No title' }),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Bad Request',
    message: 'Title is required and must be a non-empty string.',
  });
});

test('Mongoose validation errors are returned as structured JSON', async () => {
  const response = await fetch(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'T'.repeat(201) }),
  });

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.error, 'Validation Error');
  assert.equal(body.message, 'Task validation failed.');
  assert.deepEqual(body.details, [
    { field: 'title', message: 'Title cannot exceed 200 characters.' },
  ]);
  assert.equal(body.stack, undefined);
});

test('GET /tasks/:id rejects malformed ObjectIds without querying MongoDB', async () => {
  const response = await fetch(`${baseUrl}/tasks/not-an-object-id`);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Bad Request',
    message: 'Task ID must be a valid MongoDB ObjectId.',
  });
});

test('task CRUD persists documents in MongoDB', databaseTests, async () => {
  let taskId;

  try {
    const createResponse = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `P05 integration ${new Date().toISOString()}`,
        description: 'Created by MongoDB integration test',
      }),
    });

    assert.equal(createResponse.status, 201);
    const createdTask = await createResponse.json();
    taskId = createdTask._id;
    assert.ok(taskId);
    assert.equal(createdTask.completed, false);
    assert.equal(createdTask.description, 'Created by MongoDB integration test');
    assert.ok(createdTask.createdAt);

    const listResponse = await fetch(`${baseUrl}/tasks`);
    assert.equal(listResponse.status, 200);
    const tasks = await listResponse.json();
    assert.ok(tasks.some((task) => task._id === taskId));

    const readResponse = await fetch(`${baseUrl}/tasks/${taskId}`);
    assert.equal(readResponse.status, 200);
    assert.equal((await readResponse.json())._id, taskId);

    const updateResponse = await fetch(`${baseUrl}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated P05 task', completed: true }),
    });
    assert.equal(updateResponse.status, 200);
    const updatedTask = await updateResponse.json();
    assert.equal(updatedTask.title, 'Updated P05 task');
    assert.equal(updatedTask.completed, true);

    const persistedTask = await Task.findById(taskId).lean();
    assert.equal(persistedTask.title, 'Updated P05 task');
    assert.equal(persistedTask.completed, true);

    const deleteResponse = await fetch(`${baseUrl}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    assert.equal(deleteResponse.status, 200);
    assert.equal((await deleteResponse.json()).task._id, taskId);
    assert.equal(await Task.findById(taskId), null);
  } finally {
    if (taskId) {
      await Task.findByIdAndDelete(taskId);
    }
  }
});

test('PUT /tasks rejects an invalid title with structured JSON', databaseTests, async () => {
  const task = await Task.create({ title: 'Validation test task' });

  try {
    const response = await fetch(`${baseUrl}/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ' }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'Bad Request');
    assert.equal(body.message, 'Title must be a non-empty string.');
    assert.equal(body.stack, undefined);
  } finally {
    await Task.findByIdAndDelete(task.id);
  }
});
