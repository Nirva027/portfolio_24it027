# Practical 12: Continuous Integration with GitHub Actions

This practical adds automated checks for the task-management application from Practical 11. The workflow installs dependencies, runs the backend test suite against a temporary MongoDB service, and builds the React frontend whenever a commit is pushed to `main`.

## Workflow location

GitHub Actions only discovers workflow files under the repository-level `.github/workflows` directory. The workflow is therefore at [`../.github/workflows/practical-12-ci.yml`](../.github/workflows/practical-12-ci.yml); its commands are scoped to this practical's `p12/backend` and `p12/frontend` directories. This keeps the app and practical documentation together without putting the workflow somewhere GitHub would ignore.

## Pipeline checks

The workflow has two independent jobs that run in parallel:

1. **Backend tests** starts MongoDB 7 as a GitHub Actions service, installs backend dependencies with `npm install`, and runs `npm test` on Node.js 22.
2. **Frontend production build** installs frontend dependencies with `npm install` and runs `npm run build` on Node.js 22.

The workflow supplies a disposable test-only JWT secret and MongoDB database name. No production secrets or `.env` files are needed in GitHub.

## Run the checks locally

The backend tests need a reachable MongoDB instance. From PowerShell, with MongoDB running on port `27019` (the P12 Compose mapping):

```powershell
cd D:\portfolio\portfolio_24it027\p12\backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27019/student_portfolio_p12_test"
$env:JWT_SECRET = "p12-test-secret-with-at-least-thirty-two-characters"
npm install
npm test
```

Build the frontend in a separate terminal:

```powershell
cd D:\portfolio\portfolio_24it027\p12\frontend
npm install
npm run build
```

To run the P12 Docker stack as well, set a private `JWT_SECRET` of at least 32 characters and run `docker compose up --build` from the `p12` directory. It uses ports 5174 (frontend), 5002 (backend), and 27019 (MongoDB) so it can coexist with Practical 11.

## Demonstrate a failed check, then a passing check

The backend listener test includes a stable notification-message assertion. To demonstrate the red/green CI cycle safely, temporarily change the expected task title in `p12/backend/test/listeners.test.js` from `Async task` to a different title, commit and push that deliberately incorrect assertion to `main`, and open the **Practical 12 CI** run in the repository's Actions tab. The backend job must fail at the assertion. Restore the expected title to `Async task`, commit and push the correction, and verify that both jobs pass on the next run. Do not leave the intentionally broken assertion on `main`.

`npm test` can also be run in the backend folder while the assertion is deliberately incorrect to reproduce the failure locally before pushing. The other backend tests and the independent frontend build remain useful diagnostics for identifying which stage failed.
