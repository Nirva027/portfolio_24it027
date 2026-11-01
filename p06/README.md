# Practical 6: Connect the React Task UI to MongoDB

Practical 6 replaces the GitHub repository list with tasks loaded from this practical's Node/Express/Mongoose backend. The UI supports creating, viewing, editing, completing, and deleting tasks. Tasks persist in MongoDB across browser refreshes and API restarts.

The app handles loading and failures for initial task loading, create, update, completion toggles, and delete. The Vite development server proxies `/api` requests to the backend, so the browser uses the same-origin task API.

## Requirements

- Node.js 20.19+ and npm
- MongoDB Community Server running locally, or another reachable MongoDB instance

## Start the backend

In PowerShell:

```powershell
cd D:\portfolio\portfolio_24it027\p06\backend
npm install
$env:PORT = "5056"
$env:MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p06"
npm start
```

The server connects to MongoDB before accepting requests. If you omit `MONGO_URI`, it defaults to the same local database URI shown above.

## Start the React app

In a second PowerShell window:

```powershell
cd D:\portfolio\portfolio_24it027\p06\frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, then select **Tasks** in the navigation. Add a task and description, edit it, mark it complete, or delete it.

## Verify persistence

1. Make sure MongoDB, the backend, and the frontend are running.
2. Create a task on the Tasks page.
3. Refresh the browser; the task should still be listed.
4. Stop and restart the backend while leaving MongoDB running, then refresh; the task should remain.

The backend API is also available directly:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/tasks` | List tasks |
| `GET` | `/api/tasks/:id` | Read a task |
| `POST` | `/api/tasks` | Create a task |
| `PUT` | `/api/tasks/:id` | Update a task |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/health` | Check API availability |

## Tests

The backend integration suite uses a separate test database and removes documents created by its CRUD test:

```powershell
cd D:\portfolio\portfolio_24it027\p06\backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p06_test"
npm test
```

Build and lint the frontend:

```powershell
cd D:\portfolio\portfolio_24it027\p06\frontend
npm run build
```
