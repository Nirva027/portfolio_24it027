# Practical 3: Fetch GitHub Repositories in React

This practical extends the portfolio from Practical 2. The Projects route requests public repositories from the GitHub REST API for `Nirva027` and displays each repository's name, GitHub URL, description, language, and star count.

The page provides:

- A reusable loading spinner while the request is in progress.
- A reusable error message with a retry action if the request fails.
- An empty state when the profile has no public repositories.
- Request cancellation when the Projects route unmounts.
- A list limited to 100 repositories, ordered by most recently updated.

GitHub's public API allows unauthenticated requests but applies rate limits. If the limit is reached, wait and use **Try again**.

## Run the application

From PowerShell:

```powershell
cd D:\portfolio\portfolio_24it027\p03
npm install
npm run dev
```

Open the local URL printed by Vite, then select **Projects** to see repositories load from GitHub. To check the error UI, temporarily take the browser offline in developer tools or change the configured profile URL to an invalid path; restore the URL and retry.

## Build check

```powershell
cd D:\portfolio\portfolio_24it027\p03
npm run build
```
