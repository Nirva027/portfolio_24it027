# Practical 2: React Router and Interactive Portfolio Pages

This practical extends the reusable React portfolio from Practical 1 with three client-side routes:

- `/` — Home, composed from the reusable About and Skills components.
- `/projects` — Projects page with distinct project cards.
- `/contact` — Contact page with a controlled message field and live preview.

The shared navigation uses React Router links, so navigating between pages does not trigger a full page reload. On narrow screens the navigation menu can be opened and closed. The Contact textarea is controlled by React state, and the preview updates as the message is typed.

## Run the application

From PowerShell:

```powershell
cd D:\portfolio\portfolio_24it027\p02
npm install
npm run dev
```

Open the local URL printed by Vite, then try Home, Projects, and Contact. On a narrow browser window, test the menu toggle and type into the Contact message box to see its live preview.

## Build check

```powershell
cd D:\portfolio\portfolio_24it027\p02
npm run build
```
