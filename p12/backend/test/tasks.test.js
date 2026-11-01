import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import Task from '../src/models/Task.js';
import User from '../src/models/User.js';
import taskEvents from '../src/events.js';
import taskCache, { getTaskListCacheKey } from '../src/taskCache.js';

const mongoUri =
  process.env.TEST_MONGO_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/student_portfolio_p12_test';
let server;
let baseUrl;

before(async () => {
  process.env.JWT_SECRET ||= 'p12-test-secret-with-at-least-thirty-two-characters';
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  await mongoose.connect(mongoUri);
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
  const task = new Task({
    userId: new mongoose.Types.ObjectId(),
    title: 'Schema defaults',
  });
  assert.equal(task.completed, false);
  assert.equal(task.description, '');
  assert.ok(task.createdAt instanceof Date);
});

async function postJson(path, body, token) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function registerTestUser() {
  const email = `p12-${new mongoose.Types.ObjectId()}@example.test`;
  const response = await postJson('/api/auth/register', {
    email,
    password: 'secure-password-123',
  });
  assert.equal(response.status, 201);
  return { ...(await response.json()), email };
}

test('task routes reject unauthenticated requests', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    error: 'Unauthorized',
    message: 'A valid Bearer token is required.',
  });
});

test('registration hashes passwords and login issues an expiring JWT', async () => {
  const email = `p12-auth-${new mongoose.Types.ObjectId()}@example.test`;

  try {
    const registration = await postJson('/api/auth/register', {
      email: email.toUpperCase(),
      password: 'secure-password-123',
    });
    assert.equal(registration.status, 201);
    const registered = await registration.json();
    assert.equal(registered.user.email, email);
    assert.ok(registered.token);
    assert.equal(registered.user.password, undefined);

    const storedUser = await User.findOne({ email }).select('+password');
    assert.ok(storedUser);
    assert.notEqual(storedUser.password, 'secure-password-123');
    assert.equal(await bcrypt.compare('secure-password-123', storedUser.password), true);

    const payload = JSON.parse(
      Buffer.from(registered.token.split('.')[1], 'base64url').toString()
    );
    assert.equal(payload.sub, storedUser.id);
    assert.equal(payload.exp - payload.iat, 3600);

    const login = await postJson('/api/auth/login', {
      email,
      password: 'secure-password-123',
    });
    assert.equal(login.status, 200);
    assert.equal((await login.json()).user.id, storedUser.id);

    const badLogin = await postJson('/api/auth/login', {
      email,
      password: 'incorrect-password',
    });
    assert.equal(badLogin.status, 401);
  } finally {
    const user = await User.findOne({ email });
    if (user) await Task.deleteMany({ userId: user.id });
    await User.deleteOne({ email });
  }
});

test('registration rejects malformed input and duplicate email addresses', async () => {
  const invalid = await postJson('/api/auth/register', {
    email: 'not-an-email',
    password: 'short',
  });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error, 'Bad Request');

  const firstUser = await registerTestUser();
  try {
    const duplicate = await postJson('/api/auth/register', {
      email: firstUser.email,
      password: 'another-secure-password',
    });
    assert.equal(duplicate.status, 409);
  } finally {
    await User.deleteOne({ email: firstUser.email });
  }
});

test('authenticated task CRUD is private to its owner', async () => {
  const firstUser = await registerTestUser();
  const secondUser = await registerTestUser();
  let taskId;

  try {
    const secondUserFirstList = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${secondUser.token}` },
    });
    assert.equal(secondUserFirstList.headers.get('x-cache'), 'MISS');
    assert.deepEqual(await secondUserFirstList.json(), []);

    const secondUserCachedList = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${secondUser.token}` },
    });
    assert.equal(secondUserCachedList.headers.get('x-cache'), 'HIT');

    const createResponse = await postJson(
      '/api/tasks',
      {
        title: `P11 integration ${new Date().toISOString()}`,
        description: 'Created by authenticated MongoDB test',
      },
      firstUser.token
    );

    assert.equal(createResponse.status, 201);
    const createdTask = await createResponse.json();
    taskId = createdTask._id;
    assert.equal(createdTask.userId, firstUser.user.id);
    assert.equal(createdTask.completed, false);

    const noToken = await fetch(`${baseUrl}/api/tasks/${taskId}`);
    assert.equal(noToken.status, 401);

    const otherOwnerRead = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${secondUser.token}` },
    });
    assert.equal(otherOwnerRead.status, 404);

    const invalidTaskResponse = await postJson(
      '/api/tasks',
      { title: '   ' },
      firstUser.token
    );
    assert.equal(invalidTaskResponse.status, 400);
    assert.equal((await invalidTaskResponse.json()).error, 'Bad Request');

    const otherOwnerUpdate = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secondUser.token}`,
      },
      body: JSON.stringify({ title: 'Unauthorized update' }),
    });
    assert.equal(otherOwnerUpdate.status, 404);

    const otherOwnerDelete = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secondUser.token}` },
    });
    assert.equal(otherOwnerDelete.status, 404);

    const cacheKey = getTaskListCacheKey(firstUser.user.id);
    taskCache.del(cacheKey);

    const listResponse = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${firstUser.token}` },
    });
    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.headers.get('x-cache'), 'MISS');
    const expiresAt = taskCache.getTtl(cacheKey);
    assert.ok(expiresAt - Date.now() <= 60_000);
    assert.ok(expiresAt - Date.now() > 59_000);
    assert.ok((await listResponse.json()).some((task) => task._id === taskId));

    const cachedListResponse = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${firstUser.token}` },
    });
    assert.equal(cachedListResponse.headers.get('x-cache'), 'HIT');
    assert.equal((await cachedListResponse.json()).length, 1);

    const bypassResponse = await fetch(`${baseUrl}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${firstUser.token}`,
        'Cache-Control': 'no-cache',
      },
    });
    assert.equal(bypassResponse.headers.get('x-cache'), 'BYPASS');
    const stillCachedResponse = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${firstUser.token}` },
    });
    assert.equal(stillCachedResponse.headers.get('x-cache'), 'HIT');
    await stillCachedResponse.json();

    const secondCreateResponse = await postJson(
      '/api/tasks',
      { title: 'P11 cache invalidation after create' },
      firstUser.token
    );
    assert.equal(secondCreateResponse.status, 201);
    const secondTask = await secondCreateResponse.json();
    assert.equal(taskCache.has(cacheKey), false);

    const afterCreateResponse = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${firstUser.token}` },
    });
    assert.equal(afterCreateResponse.headers.get('x-cache'), 'MISS');
    assert.equal((await afterCreateResponse.json()).length, 2);

    const updateResponse = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${firstUser.token}`,
      },
      body: JSON.stringify({ title: 'Updated P11 task', completed: true }),
    });
    assert.equal(updateResponse.status, 200);
    const updatedTask = await updateResponse.json();
    assert.equal(updatedTask.title, 'Updated P11 task');
    assert.equal(updatedTask.completed, true);
    assert.equal(taskCache.has(cacheKey), false);

    const afterUpdateResponse = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${firstUser.token}` },
    });
    assert.equal(afterUpdateResponse.headers.get('x-cache'), 'MISS');
    assert.equal((await afterUpdateResponse.json()).length, 2);

    const storedTask = await Task.findById(taskId).lean();
    assert.equal(storedTask.userId.toString(), firstUser.user.id);

    const deleteResponse = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${firstUser.token}` },
    });
    assert.equal(deleteResponse.status, 200);
    assert.equal(await Task.findById(taskId), null);
    assert.equal(taskCache.has(cacheKey), false);
    const afterDeleteResponse = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${firstUser.token}` },
    });
    assert.equal(afterDeleteResponse.headers.get('x-cache'), 'MISS');
    assert.equal((await afterDeleteResponse.json()).length, 1);
    await Task.findByIdAndDelete(secondTask._id);
    taskId = null;
  } finally {
    await Task.deleteMany({
      userId: { $in: [firstUser.user.id, secondUser.user.id] },
    });
    taskCache.del(getTaskListCacheKey(firstUser.user.id));
    taskCache.del(getTaskListCacheKey(secondUser.user.id));
    await User.deleteMany({
      _id: { $in: [firstUser.user.id, secondUser.user.id] },
    });
  }
});

test('task creation responds before notification completes and deletion emits its event', async () => {
  const user = await registerTestUser();
  const messages = [];
  const originalLog = console.log;
  const cacheKey = getTaskListCacheKey(user.user.id);
  let taskId;
  console.log = (...values) => messages.push(values.join(' '));

  try {
    let resolveCreatedEvent;
    const createdEvent = new Promise((resolve) => {
      resolveCreatedEvent = resolve;
    });
    const observeCreatedTask = (payload) => resolveCreatedEvent(payload);
    taskEvents.once('task-created', observeCreatedTask);

    const logStartIndex = messages.length;
    const startedAt = performance.now();
    const response = await postJson(
      '/api/tasks',
      { title: 'Asynchronous P11 notification' },
      user.token
    );
    const responseTimeMs = performance.now() - startedAt;
    assert.equal(response.status, 201);
    const task = await response.json();
    taskId = task._id;

    const eventPayload = await createdEvent;
    assert.equal(eventPayload.task.title, task.title);
    assert.equal(eventPayload.assignedUser, user.email);
    assert.ok(responseTimeMs < 1_800, `API response took ${responseTimeMs}ms`);
    const earlyRequestMessages = messages.slice(logStartIndex);
    assert.ok(earlyRequestMessages.some((message) => message.startsWith('[API] Response sent')));
    assert.ok(
      !earlyRequestMessages.some((message) => message.startsWith('[Notification]')),
      'Delayed notification should not finish before the API response.'
    );

    const notificationDeadline = Date.now() + 3_000;
    while (
      !messages
        .slice(logStartIndex)
        .some(
          (message) =>
            message.startsWith('[Notification]') &&
            message.includes('Asynchronous P11 notification')
        ) &&
      Date.now() < notificationDeadline
    ) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    const completedRequestMessages = messages.slice(logStartIndex);
    const apiLogIndex = completedRequestMessages.findIndex((message) =>
      message.startsWith('[API] Response sent')
    );
    const notificationIndex = completedRequestMessages.findIndex((message) =>
      message.startsWith('[Notification]') &&
      message.includes('Asynchronous P11 notification')
    );
    assert.ok(notificationIndex > apiLogIndex);
    assert.match(completedRequestMessages[notificationIndex], new RegExp(user.email));

    taskCache.del(cacheKey);
    const deleteResponse = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.token}` },
    });
    assert.equal(deleteResponse.status, 200);
    taskId = null;
    const deleteMessages = messages.slice(logStartIndex);
    const deleteApiLogIndex = deleteMessages.findIndex((message) =>
      message.startsWith('[API] Delete response sent')
    );
    const deleteEventLogIndex = deleteMessages.findIndex((message) =>
      message.startsWith('[Task deleted]')
    );
    assert.ok(deleteEventLogIndex > deleteApiLogIndex);
  } finally {
    console.log = originalLog;
    if (taskId) await Task.findByIdAndDelete(taskId);
    taskCache.del(cacheKey);
    await User.deleteOne({ _id: user.user.id });
  }
});
