# Practical 5: Connect Express to MongoDB with Mongoose

This practical extends the task REST API from Practical 4 by replacing its in-memory array with MongoDB persistence through Mongoose.

## Task model

The Mongoose schema is in `backend/src/models/Task.js` and defines:

- `title`: required, trimmed string.
- `title` is limited to 200 characters, with Mongoose validation errors returned as structured JSON.
- `description`: string defaulting to an empty string.
- `completed`: boolean defaulting to `false`.
- `createdAt`: date defaulting to `Date.now`.

The API uses Mongoose create, find, save, and delete operations. Validation errors are returned as structured JSON rather than raw Mongoose error objects.

## Start MongoDB

Install and start MongoDB Community Server locally, or use an accessible MongoDB deployment. The default local connection is:

```text
mongodb://127.0.0.1:27017/student_portfolio_p05
```

For another database, set `MONGO_URI` in PowerShell before starting the API:

```powershell
$env:MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p05"
```

Keep the connection string private if it contains credentials.

## Run the API

```powershell
cd D:\portfolio\portfolio_24it027\p05\backend
npm install
npm start
```

The server connects to MongoDB before it starts listening on port `5000`. If MongoDB cannot be reached, startup fails with a clear error rather than accepting requests that cannot be persisted.

## Endpoints

| Method | Path | Purpose | Success response |
|---|---|---|---|
| `GET` | `/tasks` | List tasks, newest first | `200 OK` |
| `GET` | `/tasks/:id` | Read a task by MongoDB ID | `200 OK`; `404 Not Found` if missing |
| `POST` | `/tasks` | Create a task | `201 Created` |
| `PUT` | `/tasks/:id` | Update title, description, or completed state | `200 OK`; `404 Not Found` if missing |
| `DELETE` | `/tasks/:id` | Delete a task | `200 OK`; `404 Not Found` if missing |

Use the MongoDB `_id` returned by `POST /tasks` for item routes. Invalid IDs and invalid task input return `400` with a structured JSON error.

## Test with Postman or Thunder Client

1. Start MongoDB and the API.
2. Send `POST http://localhost:5000/tasks` with header `Content-Type: application/json` and body:

   ```json
   {
     "title": "Connect the task API to MongoDB",
     "description": "Verify Mongoose document persistence"
   }
   ```

3. Copy the returned `_id`. Use it in `GET /tasks/:id`, `PUT /tasks/:id`, and `DELETE /tasks/:id`.
4. Call `GET /tasks` and refresh/restart the API, then call it again. The documents remain because MongoDB stores them outside the Node process.
5. Try posting `{ "description": "missing title" }` and verify the response is a readable `400` JSON error.

## Automated tests

The schema-default and request-validation tests run without MongoDB. To run the CRUD and database-validation integration tests, set a disposable database URI, then run:

```powershell
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p05_test"
cd D:\portfolio\portfolio_24it027\p05\backend
npm test
```

The integration test creates its own document, verifies create/list/read/update/delete and persisted values, and removes its test data afterward. Without `TEST_MONGO_URI` or `MONGO_URI`, only database-dependent tests are reported as skipped.
