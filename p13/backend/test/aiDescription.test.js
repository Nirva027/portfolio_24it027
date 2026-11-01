import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  AiServiceError,
  generateTaskDescription,
} from '../src/services/aiDescription.js';

test('AI description request sends the task title to OpenAI and returns readable text', async () => {
  let requestUrl;
  let requestOptions;
  const description = await generateTaskDescription('Prepare a study plan', {
    apiKey: 'test-only-key',
    fetchImpl: async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'List the topics, then schedule review sessions.' } }],
        }),
      };
    },
  });

  assert.equal(requestUrl, 'https://api.openai.com/v1/chat/completions');
  assert.equal(requestOptions.headers.Authorization, 'Bearer test-only-key');
  assert.equal(
    JSON.parse(requestOptions.body).messages[1].content,
    'Write a helpful description for this task: Prepare a study plan'
  );
  assert.equal(description, 'List the topics, then schedule review sessions.');
});

test('AI description fails clearly when the API key is missing', async () => {
  await assert.rejects(
    generateTaskDescription('Prepare a study plan', { apiKey: '' }),
    (error) => {
      assert.ok(error instanceof AiServiceError);
      assert.equal(error.status, 503);
      assert.match(error.message, /still add a task manually/);
      return true;
    }
  );
});

test('AI provider errors are reported without exposing provider response details', async () => {
  await assert.rejects(
    generateTaskDescription('Prepare a study plan', {
      apiKey: 'test-only-key',
      fetchImpl: async () => ({
        ok: false,
        json: async () => ({ error: 'private provider detail' }),
      }),
    }),
    (error) => {
      assert.equal(error.status, 502);
      assert.doesNotMatch(error.message, /private provider detail/);
      return true;
    }
  );
});

test('AI request timeout becomes a recoverable error', async () => {
  await assert.rejects(
    generateTaskDescription('Prepare a study plan', {
      apiKey: 'test-only-key',
      fetchImpl: async () => {
        const error = new Error('request timeout');
        error.name = 'TimeoutError';
        throw error;
      },
    }),
    (error) => {
      assert.equal(error.status, 504);
      assert.match(error.message, /still add a task manually/);
      return true;
    }
  );
});

test('AI network failure becomes a recoverable error without provider details', async () => {
  await assert.rejects(
    generateTaskDescription('Prepare a study plan', {
      apiKey: 'test-only-key',
      fetchImpl: async () => {
        throw new Error('private network detail');
      },
    }),
    (error) => {
      assert.equal(error.status, 502);
      assert.doesNotMatch(error.message, /private network detail/);
      assert.match(error.message, /still add a task manually/);
      return true;
    }
  );
});

test('empty AI response is rejected rather than shown as a successful suggestion', async () => {
  await assert.rejects(
    generateTaskDescription('Prepare a study plan', {
      apiKey: 'test-only-key',
      fetchImpl: async () => ({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '   ' } }] }),
      }),
    }),
    (error) => error.status === 502
  );
});
