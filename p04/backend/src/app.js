import express from 'express';

const app = express();

let tasks = [];
let nextTaskId = 1;

app.use((request, _response, next) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.originalUrl}`);
  next();
});

app.use(express.json());

function validateTaskId(request, response, next) {
  const taskId = Number(request.params.id);
  if (!Number.isSafeInteger(taskId) || taskId < 1) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Task ID must be a positive integer.',
    });
  }

  request.taskId = taskId;
  next();
}

function findTask(taskId) {
  return tasks.find((task) => task.id === taskId);
}

function validateTitle(title) {
  return typeof title === 'string' && title.trim().length > 0;
}

app.get('/tasks', (_request, response) => {
  response.status(200).json(tasks);
});

app.get('/tasks/:id', validateTaskId, (request, response) => {
  const task = findTask(request.taskId);
  if (!task) {
    return response.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${request.taskId} was not found.`,
    });
  }

  response.status(200).json(task);
});

app.post('/tasks', (request, response) => {
  const { title, description } = request.body ?? {};
  if (!validateTitle(title)) {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Title is required and must be a non-empty string.',
    });
  }

  if (description !== undefined && typeof description !== 'string') {
    return response.status(400).json({
      error: 'Bad Request',
      message: 'Description must be a string.',
    });
  }

  const task = {
    id: nextTaskId++,
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);

  response.status(201).json(task);
});

app.put('/tasks/:id', validateTaskId, (request, response) => {
  const task = findTask(request.taskId);
  if (!task) {
    return response.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${request.taskId} was not found.`,
    });
  }

  const { title, description, completed } = request.body ?? {};

  if (title !== undefined && !validateTitle(title)) {
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

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (completed !== undefined) task.completed = completed;

  response.status(200).json(task);
});

app.delete('/tasks/:id', validateTaskId, (request, response) => {
  const taskIndex = tasks.findIndex((task) => task.id === request.taskId);
  if (taskIndex === -1) {
    return response.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${request.taskId} was not found.`,
    });
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  response.status(200).json({
    message: 'Task deleted successfully.',
    task: deletedTask,
  });
});

app.use((request, response) => {
  response.status(404).json({
    error: 'Not Found',
    message: `Route ${request.method} ${request.originalUrl} was not found.`,
  });
});

app.use((error, _request, response, _next) => {
  const status = error.status === 400 ? 400 : 500;
  const message =
    status === 400 ? 'Request body must contain valid JSON.' : 'An unexpected server error occurred.';

  if (status === 500) {
    console.error('[Error]', error);
  }

  response.status(status).json({
    error: status === 400 ? 'Bad Request' : 'Internal Server Error',
    message,
  });
});

export function resetTasks() {
  tasks = [];
  nextTaskId = 1;
}

export default app;
