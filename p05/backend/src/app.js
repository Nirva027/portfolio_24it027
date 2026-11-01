import express from 'express';
import mongoose from 'mongoose';
import Task from './models/Task.js';

const app = express();

app.use((request, _response, next) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
  next();
});

app.use(express.json());

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

app.get('/tasks', async (_request, response) => {
  const tasks = await Task.find().sort({ createdAt: -1 }).lean();
  response.status(200).json(tasks);
});

app.get('/tasks/:id', validateTaskId, async (request, response) => {
  const task = await Task.findById(request.params.id).lean();
  if (!task) {
    return response.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${request.params.id} was not found.`,
    });
  }

  response.status(200).json(task);
});

app.post('/tasks', validateTaskInput, async (request, response) => {
  const { title, description, completed } = request.body;
  const task = await Task.create({
    title: title.trim(),
    ...(description !== undefined ? { description: description.trim() } : {}),
    ...(completed !== undefined ? { completed } : {}),
  });

  response.status(201).json(task);
});

app.put(
  '/tasks/:id',
  validateTaskId,
  validateTaskInput,
  async (request, response) => {
    const task = await Task.findById(request.params.id);
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
    response.status(200).json(task);
  }
);

app.delete('/tasks/:id', validateTaskId, async (request, response) => {
  const task = await Task.findByIdAndDelete(request.params.id);
  if (!task) {
    return response.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${request.params.id} was not found.`,
    });
  }

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
