# Practical 8: Lazy Loading and Route-Based Code Splitting

This practical builds on the authenticated task application from Practical 7. The Tasks, Contact, Sign in, and Not Found pages are loaded with `React.lazy()` only when their route is visited. Home stays eager so the common entry page does not wait on an additional chunk request. A React `Suspense` boundary displays an accessible spinner while a lazy page chunk is being downloaded. This keeps code for routes the visitor has not opened out of the initial page load.

The task application does not have a Projects page, so its equivalent route-based pages (Tasks and Contact) are lazy-loaded, along with the other page routes.

## Requirements

- Node.js 20.19+ and npm
- MongoDB Community Server running locally, or another reachable MongoDB instance

## Start the backend

In PowerShell:

```powershell
cd D:\portfolio\portfolio_24it027\p08\backend
npm install
$env:PORT = "5058"
$env:MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p08"
$env:JWT_SECRET = "replace-this-with-a-private-random-secret-at-least-32-chars"
npm start
```

`JWT_SECRET` is required and must be at least 32 characters. Keep it private; do not commit real secrets.

## Start the frontend

In a second PowerShell window:

```powershell
cd D:\portfolio\portfolio_24it027\p08\frontend
npm install
npm run dev
```

Open the Vite URL. Register or sign in to use the protected task page. Backend API calls are proxied to port `5058`.

## Build and preview

```powershell
cd D:\portfolio\portfolio_24it027\p08\frontend
npm run build
npm run preview
```

The production build emits separate route chunks under `dist/assets`. The initial visit downloads only the application shell and the current route's code. Visiting a different route downloads that page's chunk on demand.

## Bundle and load-time comparison

The baseline is the Practical 7 production build, before route-based lazy loading. The optimized result is the Practical 8 production build. Bundle sizes below are measured from Vite's production build output; browser timings use a cold page load and route navigation in the same local Chromium session.

| Measurement | P7 baseline | P8 lazy routes |
|---|---:|---:|
| Initial JS decoded size | 274,938 bytes | 266,400 bytes |
| Initial JS browser transfer | 86,204 bytes | 84,306 bytes |
| Median `DOMContentLoaded` (5 cold runs) | 189 ms | 252 ms |
| Median time until Home heading rendered (5 cold runs) | 247 ms | 298 ms |
| Tasks route chunk | Included in initial bundle | 6.42 kB (2.18 kB gzip), fetched when opened |
| Contact route chunk | Included in initial bundle | 1.28 kB (0.64 kB gzip), fetched when opened |

Initial JavaScript decreased by **8,538 bytes (3.1%) decoded**; browser transfer decreased by **1,898 bytes (2.2%)**. The Home heading timing was 51 ms slower in this local run, and the five-run ranges overlapped (P7: 197–331 ms; P8: 215–347 ms). Local timing varied enough that this small difference is not evidence of a consistent regression or improvement. The benefit demonstrated here is the smaller initial payload and deferral of pages that have not been opened; route chunks are downloaded on navigation.

To reproduce the comparison, open DevTools **Network**, enable **Disable cache**, reload Home five times, and record JavaScript transfer size and `DOMContentLoaded`. Record the time until the Home heading is visible as a route-render measure. Then open Tasks and Contact and confirm their JS chunks appear only after navigation. For a more stable classroom comparison, use the same device and browser with DevTools network throttling enabled for both versions; actual timings depend on the machine and network.

## Tests

The backend tests use a separate P8 database:

```powershell
cd D:\portfolio\portfolio_24it027\p08\backend
$env:TEST_MONGO_URI = "mongodb://127.0.0.1:27017/student_portfolio_p08_test"
$env:JWT_SECRET = "p08-test-secret-with-at-least-thirty-two-characters"
npm test
```

The P8 backend preserves the P7 authentication and owner-scoped task API so the frontend remains fully functional.
