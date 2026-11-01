function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function registerTaskListeners(
  taskEvents,
  {
    delayMs = 2_000,
    log = (message) => console.log(message),
    errorLog = (message) => console.error(message),
  } = {}
) {
  taskEvents.on('error', (error) => {
    errorLog(`[TaskEvents error] ${error.message}`);
  });

  taskEvents.on('task-created', async (payload) => {
    try {
      const { task, assignedUser } = payload ?? {};
      await wait(delayMs);
      if (typeof task?.title !== 'string' || !task.title) {
        throw new Error('task-created event requires a task title.');
      }

      const createdAt = new Date(task.createdAt).toISOString();
      log(
        `[Notification] Task "${task.title}" created at ${createdAt}; assigned user: ${assignedUser}; handler completed at ${new Date().toISOString()}`
      );
    } catch (error) {
      taskEvents.emit('error', error);
    }
  });

  taskEvents.on('task-deleted', ({ task, assignedUser }) => {
    log(
      `[Task deleted] "${task.title}" was deleted by ${assignedUser} at ${new Date().toISOString()}.`
    );
  });
}
