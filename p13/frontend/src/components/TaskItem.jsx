import { useState } from 'react';

function TaskItem({ task, busy, error, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  async function saveChanges(event) {
    event.preventDefault();
    const updated = await onUpdate(task._id, { title, description });
    if (updated) setIsEditing(false);
  }

  return (
    <article className={`task-card${task.completed ? ' task-card-done' : ''}`}>
      {isEditing ? (
        <form className="task-edit-form" onSubmit={saveChanges}>
          <label>
            <span className="visually-hidden">Task title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              required
              aria-label="Task title"
            />
          </label>
          <label>
            <span className="visually-hidden">Task description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              aria-label="Task description"
            />
          </label>
          <div className="task-actions">
            <button className="small-button small-button-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button
              className="small-button"
              type="button"
              onClick={() => {
                setTitle(task.title);
                setDescription(task.description || '');
                setIsEditing(false);
              }}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <label className="task-check">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(event) => onToggle(task, event.target.checked)}
              disabled={busy}
              aria-label={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`}
            />
            <span className="checkmark" aria-hidden="true" />
          </label>
          <div className="task-content">
            <h2>{task.title}</h2>
            {task.description && <p>{task.description}</p>}
            <span className="task-date">
              Added {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="task-actions">
            <button
              className="small-button"
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={busy}
              aria-label={`Edit ${task.title}`}
            >
              Edit
            </button>
            <button
              className="small-button small-button-danger"
              type="button"
              onClick={() => onDelete(task._id)}
              disabled={busy}
              aria-label={`Delete ${task.title}`}
            >
              {busy ? '…' : 'Delete'}
            </button>
          </div>
        </>
      )}
      {error && <p className="task-action-error" role="alert">{error}</p>}
    </article>
  );
}

export default TaskItem;
