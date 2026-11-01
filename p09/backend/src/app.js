import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Task from './models/Task.js';
import User from './models/User.js';
import taskCache, {
  getTaskListCacheKey,
  invalidateTaskListCache,
} from './taskCache.js';

const app = express();

app.use((request, _response, next) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
  next();
});

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    { sub: user.id, email: user.email },
    secret,
    { expiresIn: '1h' }
  );
}

function requireAuth(request, response, next) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';

  if (!token) {
    return response.status(401).json({
      error: 'Unauthorized',
      message: 'A valid Bearer token is required.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured.');
    const payload = jwt.verify(token, secret);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      throw new Error('Invalid token payload.');
    }

    request.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return response.status(401).json({
      error: 'Unauthorized',
      message: 'The access token is invalid or expired. Please sign in again.',
    });
  }
}

app.post('/api/auth/register', async (request, response) => {
  const email =
    typeof request.body?.email === 'string'
      ? request.body.email.trim().toLowerCase()
      : '';
  const password =
    typeof request.body?.password === 'string' ? request.body.password : '';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Enter a valid email address.',
    });
  }

  if (password.length < 8 || password.length > 72) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Password must be between 8 and 72 characters.',
    });
  }

  const existingUser = await User.findOne({ email }).select('_id').lean();
  if (existingUser) {
    return response.status(409).json({
      error: 'Conflict',
      message: 'An account with this email already exists.',
    });
  }

  const user = await User.create({
    email,
    password: await bcrypt.hash(password, 12),
  });

  response.status(201).json({
    token: createToken(user),
    user: { id: user.id, email: user.email },
  });
});

app.post('/api/auth/login', async (request, response) => {
  const email =
    typeof request.body?.email === 'string'
      ? request.body.email.trim().toLowerCase()
      : '';
  const password =
    typeof request.body?.password === 'string' ? request.body.password : '';

  if (!email || !password) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Email and password are required.',
    });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return response.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid email or password.',
    });
  }

  response.status(200).json({
    token: createToken(user),
    user: { id: user.id, email: user.email },
  });
});

app.get('/api/auth/me', requireAuth, async (request, response) => {
  const user = await User.findById(request.user.id).select('_id email').lean();
  if (!user) {
    return response.status(401).json({
      error: 'Unauthorized',
      message: 'Account no longer exists. Please sign in again.',
    });
  }

  response.status(200).json({ id: user._id, email: user.email });
});

function validateTaskId(request, response, next) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Task ID must be a valid MongoDB ObjectId.',
    });
  }

  next();
}

function validateTaskInput(request, response, next) {
  const { title, description, completed } = request.body ?? {};

  if (
    request.method === 'POST' &&
    (typeof title !== 'string' || title.trim().length === 0)
  ) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Title is required and must be a non-empty string.',
    });
  }

  if (
    title !== undefined &&
    (typeof title !== 'string' || title.trim().length === 0)
  ) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Title must be a non-empty string.',
    });
  }

  if (description !== undefined && typeof description !== 'string') {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Description must be a string.',
    });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Completed must be a boolean.',
    });
  }

  next();
}

app.get('/api/tasks', requireAuth, async (request, response) => {
  const cacheKey = getTaskListCacheKey(request.user.id);
  const bypassCache = request
    .get('Cache-Control')
    ?.split(',')
    .some((directive) => directive.trim().toLowerCase() === 'no-cache');

  if (!bypassCache && taskCache.has(cacheKey)) {
    response.set('X-Cache', 'HIT');
    return response.status(200).json(taskCache.get(cacheKey));
  }

  const tasks = await Task.find({ userId: request.user.id })
    .sort({ createdAt: -1 })
    .lean();
  response.set('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
  if (!bypassCache) taskCache.set(cacheKey, tasks);
  response.status(200).json(tasks);
});

app.get('/api/tasks/:id', requireAuth, validateTaskId, async (request, response) => {
  const task = await Task.findOne({
    _id: request.params.id,
    userId: request.user.id,
  }).lean();
  if (!task) {
    return response.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${request.params.id} was not found.`,
    });
  }

  response.status(200).json(task);
});

app.post('/api/tasks', requireAuth, validateTaskInput, async (request, response) => {
  const { title, description, completed } = request.body;
  const task = await Task.create({
    userId: request.user.id,
    title: title.trim(),
    ...(description !== undefined ? { description: description.trim() } : {}),
    ...(completed !== undefined ? { completed } : {}),
  });

  invalidateTaskListCache(request.user.id);
  response.status(201).json(task);
});

app.put(
  '/api/tasks/:id',
  requireAuth,
  validateTaskId,
  validateTaskInput,
  async (request, response) => {
    const task = await Task.findOne({
      _id: request.params.id,
      userId: request.user.id,
    });
    if (!task) {
      return response.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${request.params.id} was not found.`,
      });
    }

    const { title, description, completed } = request.body;
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (completed !== undefined) task.completed = completed;

    await task.save();
    invalidateTaskListCache(request.user.id);
    response.status(200).json(task);
  }
);

app.delete('/api/tasks/:id', requireAuth, validateTaskId, async (request, response) => {
  const task = await Task.findOneAndDelete({
    _id: request.params.id,
    userId: request.user.id,
  });
  if (!task) {
    return response.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${request.params.id} was not found.`,
    });
  }

  invalidateTaskListCache(request.user.id);
  response.status(200).json({
    message: 'Task deleted successfully.',
    task,
  });
});

app.use((request, response) => {
  response.status(404).json({
    error: 'Not Found',
    message: `Route ${request.method} ${request.originalUrl} was not found.`,
  });
});

app.use((error, _request, response, _next) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return response.status(400).json({
      error: 'Validation Error',
      message: 'Task validation failed.',
      details: Object.values(error.errors).map(({ path, message }) => ({
        field: path,
        message,
      })),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return response.status(400).json({
      error: 'Bad Request',
      message: `Invalid value for "${error.path}".`,
    });
  }

  if (error.code === 11000) {
    return response.status(409).json({
      error: 'Conflict',
      message: 'A task with this value already exists.',
    });
  }

  if (error.status === 400 && error.type === 'entity.parse.failed') {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Request body must contain valid JSON.',
    });
  }

  console.error('[Error]', error);
  response.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected server error occurred.',
  });
});

export default app;
