# Ceremoniq — Event & Venue Management Platform

A modern React + Vite event/venue management app with a fully redesigned UI featuring indigo/rose/gold palette, real venue images, and animations throughout.

## Overview

Full-stack-ready frontend for managing venues, bookings, company registrations, and user accounts. Backend lives at `localhost:7000` (ERR_CONNECTION_REFUSED is expected in dev — the app handles it gracefully).

### Roles
- **Admin** — Manages company requests, venue requests, all venues, all companies, all users, and edit requests
- **Owner** — Manages their company's venues, incoming booking requests, and their own edit requests
- **User** — Browses venues and manages their own bookings

## Tech Stack

- **Frontend**: React 19, functional components + hooks
- **Build Tool**: Vite 8
- **Package Manager**: pnpm
- **Styling**: CSS-in-JS (embedded `<style>` template literals per page) + global.css
- **Auth**: localStorage/JWT via `src/lib/authSession.js`
- **Port**: 5000 (host 0.0.0.0, allowedHosts: true)

## Design System

**Color palette**:
- `--primary` #4f46e5 (indigo)
- `--primary-dark` #3730a3
- `--accent` #f43f5e (rose)
- `--gold` #f59e0b
- `--bg` #fff / `--bg-alt` #f8f7ff
- `--text` #1e1b4b / `--muted` #64748b / `--border` #e2e8f0

**Font**: Inter (Google Fonts)

**Shared dashboard utility**: `src/pages/Dashboard/dashboardPageStyles.js`
- `makeDashStyles(prefix)` — generates complete modern CSS for a dashboard page prefix

## Project Structure

```
src/
  app/                    - Root App component + routing logic
  lib/
    apiClient.js          - Fetch wrapper with error handling
    authSession.js        - localStorage/JWT session management
    validation.js         - Input validation utilities
  pages/
    Home/
      HomePage.jsx        - Animated hero, real venue images, how-it-works, CTA
    Auth/
      AuthPage.jsx        - Split-screen sign in/sign up with entry animations
    CompanyRegistration/
      CompanyRegistration.jsx - Owner company registration form
    Dashboard/
      dashboardPageStyles.js  - Shared makeDashStyles(prefix) utility
      DashboardLayout.jsx     - Sidebar + topbar with slide-in animations
      AdminDashboard.jsx      - Admin overview page
      Venues.jsx              - Venue cards grid (vp- prefix)
      Bookings.jsx            - Bookings table (bk- prefix)
      CompanyRequests.jsx     - Admin company request review (or- prefix)
      VenueRequests.jsx       - Admin venue request review (vr- prefix)
      Users.jsx               - Admin user management two-panel (up- prefix)
      Companies.jsx           - Admin companies accordion (cp- prefix)
      EditRequests.jsx        - Venue edit request diff viewer (er- prefix)
  styles/
    global.css              - Base reset + font
  main.jsx                  - Entry point
public/
  event-hero.png            - Auth page hero image
```

## Animations

- **HomePage**: IntersectionObserver scroll animations, staggered delays, floating cards, animated gradient hero
- **AuthPage**: Image panel slides in from left, form panel slides in from right
- **DashboardLayout**: Sidebar slides in from left, nav items stagger-fade up, main content fades in
- **Dashboard pages**: Cards fadeUp, tables fadeUp, toolbar fadeIn (all via makeDashStyles)
- **Buttons**: translateY lift on hover throughout

## Development

```bash
pnpm install
pnpm run dev   # Starts on port 5000
pnpm run build
```
