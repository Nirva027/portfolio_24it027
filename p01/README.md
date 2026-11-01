# Practical 1: Student Portfolio with React and Vite

This practical starts the portfolio as a React single-page application built with Vite. Its page is composed from four reusable components:

- `Header` receives the student's name and role through props.
- `About` receives student, university, and program information through props.
- `Skills` receives a list of skills through props and renders it as a reusable list.
- `Footer` receives a contact email through props.

Each component has its own file under `src/components`. `App.jsx` composes them into the page and passes data rather than duplicating their JSX.

## Run the application

From PowerShell:

```powershell
cd D:\portfolio\p01
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build check

```powershell
cd D:\portfolio\p01
npm run build
```
