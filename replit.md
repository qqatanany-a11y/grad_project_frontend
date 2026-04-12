# grad_project

An event planning web application with an elegant authentication UI.

## Overview

A React + Vite event planning application with a "Plan Your Perfect Event!" theme. Features a minimal airy split-screen auth page and a full dashboard for managing events.

### Pages
- **Auth** — Split-screen sign in / sign up with validation
- **Overview** — Stats cards + recent events table
- **My Events** — Searchable, filterable events list with delete
- **Create Event** — Form to add new events (saved to localStorage)

## Tech Stack

- **Frontend**: React 19 with functional components and hooks
- **Build Tool**: Vite 8
- **Package Manager**: npm
- **Styling**: CSS (global styles + component-level CSS-in-JS)
- **Linting**: ESLint with React plugins

## Project Structure

```
src/
  app/          - Root App component
  assets/       - Images and SVG assets
  components/
    auth/       - AuthForm.jsx, OverlayPanel.jsx
  pages/
    Auth/       - AuthPage.jsx (main auth layout)
  styles/       - global.css
  main.jsx      - Entry point
```

## Development

```bash
npm install
npm run dev     # Starts dev server on port 5000
npm run build   # Builds to dist/
```

## Deployment

Configured as a static site deployment:
- Build command: `npm run build`
- Public directory: `dist`
