# Practical 7: Authentication and Protected Tasks

This practical adds user registration and sign-in to the MongoDB-backed task app. Passwords are hashed with bcrypt before storage. Successful registration and login return a JWT with a one-hour expiry. The frontend stores the token for the current browser and sends it as a Bearer token to protected API routes.

Tasks are associated with their owner. Every task operation requires a valid JWT and only reads or changes tasks belonging to the signed-in user.

## Requirements

- Node.js 20.19+ and npm
- MongoDB Community Server running locally, or another reachable MongoDB instance

## Start the backend

In PowerShell:

```powershell
cd D:\portfolio\portfolio_24it027\p07\backend
npm install
$env:PORT = "5057"
$env:MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p07"
$env:JWT_SECRET = "replace-this-with-a-private-random-secret-at-least-32-chars"
npm start
```

`JWT_SECRET` is required and must be at least 32 characters. Keep it private; do not commit real secrets. The API connects to MongoDB before accepting requests.

## Start the frontend

In a second PowerShell window:

```powershell
cd D:\portfolio\portfolio_24it027\p07\frontend
npm install
npm run dev
```

Open the Vite URL, select **Sign in**, and create an account. Then use **Tasks** to create, edit, complete, and delete tasks. Sign out and sign into a second account to verify that each user's task list is private. Reloading the browser restores a valid session; expired or invalid tokens are cleared and protected routes return to sign-in.

## Authentication API

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Validate email/password, hash password, create account, return JWT |
| `POST` | `/api/auth/login` | Verify password and return JWT |
| `GET` | `/api/auth/me` | Return the current account; requires Bearer JWT |

Passwords must be 8–72 characters. Emails are normalized to lowercase, and duplicate accounts are rejected.

## Protected task API

All task routes require `Authorization: Bearer <token>`:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/tasks` | List tasks belonging to the current user |
| `GET` | `/api/tasks/:id` | Read an owned task |
| `POST` | `/api/tasks` | Create a task for the current user |
| `PUT` | `/api/tasks/:id` | Update an owned task |
| `DELETE` | `/api/tasks/:id` | Delete an owned task |

Requests without a valid token return `401 Unauthorized`. A task owned by a different account is returned as `404 Not Found`.

## Tests

The integration tests use a separate test database and clean up created test users and tasks:

```powershell
cd D:\portfolio\portfolio_24it027\p07\backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p07_test"
$env:JWT_SECRET = "p07-test-secret-with-at-least-thirty-two-characters"
npm test
```

The tests cover authentication, password hashing, token expiry, protected routes, per-user task isolation, validation, and task CRUD.
