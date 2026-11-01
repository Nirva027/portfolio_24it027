# Practical 10: Asynchronous Processing with EventEmitter

This practical adds in-process background notifications to the authenticated task application. When a task is created or deleted, the API responds first and then emits a Node.js built-in `EventEmitter` event. Task notifications run after an artificial two-second delay and log the task title, creation time, and assigned user's email.

The project also retains Practical 9's 60-second per-user task-list cache. Successful create, update, and delete operations invalidate only that user's cached list.

## Requirements

- Node.js 20.19+ and npm
- MongoDB Community Server running locally, or another reachable MongoDB instance

## Start the backend

In PowerShell:

```powershell
cd D:\portfolio\portfolio_24it027\p10\backend
npm install
$env:PORT = "5060"
$env:MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p10"
$env:JWT_SECRET = "replace-this-with-a-private-random-secret-at-least-32-chars"
npm start
```

Keep the JWT secret private; do not commit real credentials. The API connects to MongoDB before it accepts requests.

## Start the frontend

In a second PowerShell window:

```powershell
cd D:\portfolio\portfolio_24it027\p10\frontend
npm install
npm run dev
```

Open the Vite URL, register or sign in, and use **Tasks** to create and delete tasks. The frontend proxies API requests to port `5060`.

## Observe asynchronous notifications

1. Sign in to the app and open **Tasks**.
2. Create a task. The API sends its `201 Created` response immediately; the notification listener waits two seconds before logging.
3. Check the backend console. The `[API] Response sent` timestamp should appear before the `[Notification]` line, which includes the title, task creation time, assigned account email, and handler completion time.
4. Delete a task. A separate `[Task deleted]` message is emitted after the delete response.
5. Backend integration tests also send an invalid task-created event to verify that listener exceptions are caught and logged by the registered `error` listener.

To try the API directly, send `POST /api/auth/register` with JSON containing `email` and `password`, then copy the returned token. Send the task request with `Authorization: Bearer <token>`:

```json
{
  "title": "Review EventEmitter",
  "description": "Observe the delayed background notification."
}
```

The task endpoint is `POST http://localhost:5060/api/tasks`. Use the same authorization header and `DELETE /api/tasks/<task-id>` to see the task-deleted event.

## Why EventEmitter here?

`emit()` invokes its registered callbacks synchronously; it does not create a worker or wait for a listener's returned Promise. In this practical the listener schedules its two-second delay and returns to the event loop, and the route emits only after writing the HTTP response. Thus the delay does not hold up the response. Putting notification work and its delay directly in the request path would make the client wait for it.

An in-process emitter is simple and suitable for demonstrating decoupled work in a small single-process application. It is not a durable queue: events are lost on process restart, work is not shared across instances, and there is no built-in retry or back-pressure. High-volume production workloads usually need a durable message broker and independently scalable workers.

## Tests

The integration tests use a dedicated test database and check authentication, task-cache invalidation, response-before-notification timing, the delete event, and error handling:

```powershell
cd D:\portfolio\portfolio_24it027\p10\backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p10_test"
$env:JWT_SECRET = "p10-test-secret-with-at-least-thirty-two-characters"
npm test
```
