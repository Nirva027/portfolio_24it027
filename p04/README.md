# Practical 4: Node.js and Express REST API

This practical adds a standalone Node.js and Express task API. Tasks are stored in an in-memory array, so they are reset when the server restarts. Every request is logged with its method, URL, and ISO timestamp. Validation and malformed JSON errors use structured JSON responses, and a global error handler is the final middleware.

## Run the API

In PowerShell:

```powershell
cd D:\portfolio\portfolio_24it027\p04\backend
npm install
npm start
```

The API listens on port `5000`. Override the port by setting `PORT` before starting the server.

## Endpoints

| Method | Path | Purpose | Success response |
|---|---|---|---|
| `GET` | `/tasks` | List tasks | `200 OK` |
| `GET` | `/tasks/:id` | Read one task | `200 OK`; `404 Not Found` if missing |
| `POST` | `/tasks` | Create a task | `201 Created` |
| `PUT` | `/tasks/:id` | Update title, description, or completed state | `200 OK`; `404 Not Found` if missing |
| `DELETE` | `/tasks/:id` | Delete a task | `200 OK`; `404 Not Found` if missing |

Task IDs are positive integers. A task has an `id`, required non-empty `title`, `description`, `completed` flag, and ISO `createdAt` timestamp.

## Try it with PowerShell

Create a task:

```powershell
$body = @{ title = "Learn Express"; description = "Build a REST API" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/tasks" -ContentType "application/json" -Body $body
```

Read all tasks:

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5000/tasks"
```

Update task 1:

```powershell
$body = @{ title = "Learn Express deeply"; completed = $true } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri "http://localhost:5000/tasks/1" -ContentType "application/json" -Body $body
```

Delete task 1:

```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:5000/tasks/1"
```

## Tests

Run the automated CRUD, validation, 404, and malformed JSON tests:

```powershell
cd D:\portfolio\portfolio_24it027\p04\backend
npm test
```
