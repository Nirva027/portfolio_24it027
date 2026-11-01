import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { registerTaskListeners } from '../src/listeners.js';

test('task-created listener returns before its delayed notification completes', async () => {
  const taskEvents = new EventEmitter();
  const messages = [];
  let resolveNotification;
  const notification = new Promise((resolve) => {
    resolveNotification = resolve;
  });

  registerTaskListeners(taskEvents, {
    delayMs: 10,
    log: (message) => {
      messages.push(message);
      resolveNotification();
    },
    errorLog: (message) => messages.push(message),
  });

  taskEvents.emit('task-created', {
    task: { title: 'Async task', createdAt: new Date().toISOString() },
    assignedUser: 'student@example.test',
  });
  assert.deepEqual(messages, []);

  await notification;
  assert.match(messages[0], /Task "Deliberately incorrect expectation" created at/);
  assert.match(messages[0], /assigned user: student@example\.test/);
  assert.match(messages[0], /handler completed at/);
});

test('task-deleted listener logs its own notification', () => {
  const taskEvents = new EventEmitter();
  const messages = [];
  registerTaskListeners(taskEvents, {
    log: (message) => messages.push(message),
    errorLog: (message) => messages.push(message),
  });

  taskEvents.emit('task-deleted', {
    task: { title: 'Removed task' },
    assignedUser: 'student@example.test',
  });

  assert.equal(messages.length, 1);
  assert.match(messages[0], /\[Task deleted\] "Removed task" was deleted/);
  assert.match(messages[0], /student@example\.test/);
});

test('task-created listener reports handler errors through the error event', async () => {
  const taskEvents = new EventEmitter();
  const errors = [];
  let resolveError;
  const errorReported = new Promise((resolve) => {
    resolveError = resolve;
  });
  registerTaskListeners(taskEvents, {
    delayMs: 0,
    log: () => assert.fail('Invalid task must not be logged as successful.'),
    errorLog: (message) => {
      errors.push(message);
      resolveError();
    },
  });

  taskEvents.emit('task-created', { task: {}, assignedUser: 'student@example.test' });
  await errorReported;

  assert.deepEqual(errors, [
    '[TaskEvents error] task-created event requires a task title.',
  ]);
});
