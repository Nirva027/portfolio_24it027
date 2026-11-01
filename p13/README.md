# Practical 13: AI-Powered Task Description Suggestions

This practical adds an optional AI helper to the authenticated task form. Enter a task title and choose **Draft with AI** to generate a concise, practical description using the OpenAI API. The generated text appears in the editable description field; review or change it before saving the task.

The React app calls the Express API. Only the backend calls OpenAI, using `OPENAI_API_KEY` from its environment. The API key is never sent to or bundled into the frontend. The normal task form and CRUD endpoints continue to work if the key is not configured, the provider is unavailable, or a request times out.

## Configure the backend

Create a private environment file from the example. Do not commit `.env` or paste a real API key into source code:

```powershell
cd D:\portfolio\portfolio_24it027\p13\backend
Copy-Item .env.example .env
```

Edit `backend\.env` and set `JWT_SECRET` to a private random value with at least 32 characters and `OPENAI_API_KEY` to your OpenAI API key. `dotenv` loads this file when the backend starts locally. Keep the key only in the backend environment. The `.env` file is excluded from Docker build contexts and Git.

## Run locally

Start MongoDB on port 27020 (or update `MONGO_URI` in `backend\.env` to your local MongoDB address), then start the backend:

```powershell
cd D:\portfolio\portfolio_24it027\p13\backend
npm install
npm start
```

In another terminal, start the frontend:

```powershell
cd D:\portfolio\portfolio_24it027\p13\frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal, register or sign in, and go to the Tasks page. Enter a title and select **Draft with AI**. The resulting description can be edited before selecting **Add task**.

## Run the complete Docker stack

From `p13`, set the backend secrets in the current PowerShell session and run Compose:

```powershell
cd D:\portfolio\portfolio_24it027\p13
$secretBytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($secretBytes)
$env:JWT_SECRET = [Convert]::ToBase64String($secretBytes)
$env:OPENAI_API_KEY = "your-private-OpenAI-key"
docker compose up --build
```

The frontend is available at [http://localhost:5175](http://localhost:5175). The backend is published on port 5003 and MongoDB on 27020. Compose passes `OPENAI_API_KEY` only to the backend container. If the key is unset, the AI suggestion displays a recoverable message and manually written tasks still work. Stop the stack with `Ctrl+C`, or run `docker compose down` in another terminal after setting the same `JWT_SECRET`.

The P13 Compose project and database are separate from Practical 11 and 12; the stack uses a named MongoDB volume so tasks persist across container restarts.

## API endpoint

`POST /api/ai/task-description` requires the existing bearer-token authentication and accepts:

```json
{
  "title": "Prepare a study plan"
}
```

A successful response contains display-ready text:

```json
{
  "description": "List the topics to cover, then schedule focused review sessions for each one."
}
```

The endpoint accepts non-empty titles up to 200 characters. It returns a clear service-unavailable or timeout response without exposing provider details or credentials; it does not create or modify a task.

## Verify the feature and failure handling

The backend tests include mocked OpenAI responses for successful generation, missing configuration, provider failures, empty responses, and timeouts. They also verify that the authenticated endpoint reports a missing key while regular task creation remains available.

```powershell
cd D:\portfolio\portfolio_24it027\p13\backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27020/student_portfolio_p13_test"
$env:JWT_SECRET = "p13-test-secret-with-at-least-thirty-two-characters"
npm install
npm test
```

Check the frontend production build:

```powershell
cd D:\portfolio\portfolio_24it027\p13\frontend
npm install
npm run build
```

If no OpenAI key is available, omit it and verify that the suggestion reports it is unavailable while manually adding tasks still works.
