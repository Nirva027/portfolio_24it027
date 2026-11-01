import { useCallback, useEffect, useState } from 'react';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Spinner from '../components/Spinner.jsx';
import TaskItem from '../components/TaskItem.jsx';
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from '../api/tasks.js';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [busyTaskId, setBusyTaskId] = useState('');
  const [taskErrors, setTaskErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      setIsLoading(true);
      setLoadError('');
      try {
        const data = await getTasks({ signal: controller.signal });
        if (!Array.isArray(data)) {
          throw new Error('The task service returned an unexpected response.');
        }
        setTasks(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLoadError(error.message || 'Unable to load tasks.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadTasks();
    return () => controller.abort();
  }, [reloadCount]);

  const runTaskAction = useCallback(async (taskId, action) => {
    setBusyTaskId(taskId);
    setTaskErrors((current) => ({ ...current, [taskId]: '' }));
    try {
      return await action();
    } catch (error) {
      setTaskErrors((current) => ({
        ...current,
        [taskId]: error.message || 'Unable to update this task.',
      }));
      return null;
    } finally {
      setBusyTaskId('');
    }
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setIsCreating(true);
    setCreateError('');
    try {
      const task = await createTask({ title, description });
      setTasks((current) => [task, ...current]);
      setTitle('');
      setDescription('');
    } catch (error) {
      setCreateError(error.message || 'Unable to create the task.');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggle(task, completed) {
    const updated = await runTaskAction(task._id, () =>
      updateTask(task._id, { completed })
    );
    if (updated) {
      setTasks((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
    }
  }

  async function handleUpdate(taskId, changes) {
    const updated = await runTaskAction(taskId, () =>
      updateTask(taskId, changes)
    );
    if (updated) {
      setTasks((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      return true;
    }
    return false;
  }

  async function handleDelete(taskId) {
    const deleted = await runTaskAction(taskId, () => deleteTask(taskId));
    if (deleted) {
      setTasks((current) => current.filter((task) => task._id !== taskId));
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <section className="route-page tasks-page" aria-labelledby="tasks-title">
      <div className="page-heading tasks-heading">
        <p className="eyebrow">A LITTLE PROGRESS, EVERY DAY</p>
        <h1 id="tasks-title">
          Make room <span>to do.</span>
        </h1>
        <p className="page-intro">
          Your tasks are saved to MongoDB, so they’ll still be here when you
          come back.
        </p>
      </div>

      <form className="task-create-form" onSubmit={handleCreate}>
        <div className="task-create-heading">
          <div>
            <p className="eyebrow">ADD TO YOUR LIST</p>
            <h2>A new task</h2>
          </div>
          <span className="task-count">
            {completedCount} / {tasks.length} done
          </span>
        </div>
        <label className="task-field">
          <span>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What would you like to work on?"
            maxLength={200}
            required
          />
        </label>
        <label className="task-field">
          <span>Description <span className="optional-label">Optional</span></span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a few helpful details..."
            rows={2}
          />
        </label>
        {createError && <p className="form-error" role="alert">{createError}</p>}
        <button
          className="create-task-button"
          type="submit"
          disabled={isCreating || !title.trim()}
        >
          {isCreating ? 'Saving task…' : 'Add task'}
          <span aria-hidden="true">↗</span>
        </button>
      </form>

      <div className="task-list-heading">
        <h2>Your list</h2>
        {!isLoading && !loadError && (
          <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        )}
      </div>

      {isLoading && <Spinner label="Loading your tasks..." />}
      {!isLoading && loadError && (
        <ErrorMessage
          message={loadError}
          onRetry={() => setReloadCount((count) => count + 1)}
        />
      )}
      {!isLoading && !loadError && tasks.length === 0 && (
        <div className="tasks-empty">
          <span aria-hidden="true">✳</span>
          <p>Your list is clear. Add a task whenever you’re ready.</p>
        </div>
      )}
      {!isLoading && !loadError && tasks.length > 0 && (
        <div className="tasks-list">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              busy={busyTaskId === task._id}
              error={taskErrors[task._id]}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Tasks;
