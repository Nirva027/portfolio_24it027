# Practical 11: Docker and Docker Compose

This practical containerizes the portfolio and authenticated task app as a three-service stack:

- **frontend:** React/Vite production build served by Nginx
- **backend:** Node.js and Express task API
- **mongodb:** official MongoDB image with a named data volume

The services communicate over the Compose `app-network`. Nginx forwards `/api` requests to the `backend` service, and the backend connects to MongoDB at `mongodb://mongodb:27017/student_portfolio_p11`.

## Requirements

- Docker Desktop running on Windows, or Docker Engine and the Compose plugin
- Node.js and npm only if running tests or building locally

Check Docker before starting:

```powershell
docker --version
docker compose version
docker info
```

## Start the full stack

In PowerShell, create a private JWT secret in the current terminal session, then start the entire stack with one Compose command:

```powershell
cd D:\portfolio\portfolio_24it027\p11
$secretBytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($secretBytes)
$env:JWT_SECRET = [Convert]::ToBase64String($secretBytes)
docker compose up --build -d
```

The Compose configuration requires `JWT_SECRET` and does not provide an insecure default. Keep the generated value private and do not put it in a frontend environment variable. The backend image receives it only as a runtime environment variable.

The frontend is available at [http://localhost:5173](http://localhost:5173). To check startup and service health:

```powershell
docker compose ps
docker compose logs backend
Invoke-RestMethod http://localhost:5001/api/health
```

Register or sign in from the frontend and create a task. The backend logs asynchronous `task-created` notifications after the API response. The stack also retains the 60-second, per-user task cache from Practical 9.

Stop the containers without deleting the database volume:

```powershell
docker compose down
```

Run `docker compose up -d` again to verify task data persists. Avoid `docker compose down -v` if you want to keep the named MongoDB data.

## Port mappings

| Service | Container port | Host port |
|---|---:|---:|
| Frontend (Nginx) | 80 | 5173 |
| Backend (Express) | 5000 | 5001 |
| MongoDB | 27017 | 27018 |

This environment already uses host ports 5000 and 27017, so Compose publishes the backend and MongoDB on 5001 and 27018 to avoid colliding with those services. Inside the Compose network, the backend still connects to MongoDB using its service name and default port: `mongodb:27017`. If ports 5000 or 27017 are free on your computer, you can change the host side of the port mappings in `docker-compose.yml`.

## Files and container design

- `backend/Dockerfile` installs from the backend lockfile and runs the API on Node 22 Alpine.
- `frontend/Dockerfile` uses a multi-stage build: Node builds the Vite app, then Nginx serves only the generated static files.
- `frontend/nginx.conf` proxies API requests to the Compose backend and falls back to `index.html` for client-side routes.
- `.dockerignore` files keep `node_modules`, build output, and `.env` files out of both image build contexts.
- `docker-compose.yml` defines the bridge network, MongoDB health check, backend startup dependency, and named `mongo-data` volume.

`EXPOSE` documents the port used by a container image; Compose `ports` publishes a host-to-container mapping. Dependencies are installed inside each image using its lockfile; local `node_modules` is excluded from Docker build contexts.

Use the MongoDB **service name** from other containers. In a container, `localhost` refers to that container itself, not the host or the MongoDB container.

This Compose setup is for the practical and local development. For production, use a managed database or configure authentication, backups, TLS, and secret management for the database and application.

## Tests and local build

The backend tests use a separate P11 test database:

```powershell
cd D:\portfolio\portfolio_24it027\p11\backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p11_test"
$env:JWT_SECRET = "p11-test-secret-with-at-least-thirty-two-characters"
npm ci
npm test
```

The frontend production build can be checked without Docker:

```powershell
cd D:\portfolio\portfolio_24it027\p11\frontend
npm ci
npm run build
```
