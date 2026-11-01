# Practical 9: In-Memory Task Caching

This practical adds NodeCache to the authenticated task API. `GET /api/tasks` caches each signed-in user's task list for 60 seconds. Cache keys are user-specific, so one account can never receive another account's tasks. Creating, updating, or deleting a task invalidates only that user's cached list.

The list endpoint returns an `X-Cache` response header:

- `MISS`: task list loaded from MongoDB and cached
- `HIT`: task list returned from memory
- `BYPASS`: MongoDB was queried without reading or updating cache (for timing comparisons)

## Requirements

- Node.js 20.19+ and npm
- MongoDB Community Server running locally, or another reachable MongoDB instance

## Start the backend

In PowerShell:

```powershell
cd D:\portfolio\portfolio_24it027\p09\backend
npm install
$env:PORT = "5059"
$env:MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p09"
$env:JWT_SECRET = "replace-this-with-a-private-random-secret-at-least-32-chars"
npm start
```

Keep the JWT secret private and do not commit real secrets. The cache uses a 60-second default TTL.

## Start the frontend

In a second PowerShell window:

```powershell
cd D:\portfolio\portfolio_24it027\p09\frontend
npm install
npm run dev
```

Register or sign in, then create tasks. The authenticated task page uses the cached API without additional frontend setup.

## Verify caching

Sign in and call `GET /api/tasks` with the JWT:

```powershell
$headers = @{ Authorization = "Bearer YOUR_JWT" }
Invoke-WebRequest -Uri "http://localhost:5059/api/tasks" -Headers $headers |
  Select-Object -ExpandProperty Headers
```

The first request should return `X-Cache: MISS`; a repeated request within 60 seconds should return `X-Cache: HIT`. Repeat with a `Cache-Control: no-cache` request header to force a database read for the uncached timing sample:

```powershell
$headers["Cache-Control"] = "no-cache"
Invoke-WebRequest -Uri "http://localhost:5059/api/tasks" -Headers $headers |
  Select-Object -ExpandProperty Headers
```

That request returns `X-Cache: BYPASS` and does not replace or clear the cached entry. After any successful task create, update, or delete, the next normal list request should be `MISS`, then subsequent reads should be `HIT`.

## Response-time comparison

Measurements were collected against the same local MongoDB/API, authenticated account, and task list of 500 documents (118,393-byte JSON response). Three `BYPASS` requests each queried MongoDB; three warmed `HIT` requests returned the cached JSON. Values are milliseconds measured client-side from immediately before `fetch()` through receipt of the response body.

| Sample | Uncached (`BYPASS`) | Cached (`HIT`) |
|---|---:|---:|
| 1 | 68.90 | 37.38 |
| 2 | 41.93 | 28.54 |
| 3 | 48.82 | 26.15 |
| **Average** | **53.22** | **30.69** |

In this run, cached reads averaged **42.3% lower response time** than uncached reads. These are sample lab measurements, not a performance guarantee; timing varies with hardware, database size, and system load. Use the same JWT and task list for each reading so the comparison is not affected by account-specific data. The automated test checks misses, hits, user isolation, bypass behavior, and invalidation on all three write methods.

## Tests

The backend tests use a separate P9 database:

```powershell
cd D:\portfolio\portfolio_24it027\p09\backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p09_test"
$env:JWT_SECRET = "p09-test-secret-with-at-least-thirty-two-characters"
npm test
```
