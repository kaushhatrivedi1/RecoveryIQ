# Frontend Guide

## Stack

- React 18
- Vite
- Tailwind CSS v3
- Recharts
- React Router

## Main Entry Points

- `src/main.jsx`
- `src/App.jsx`

## Route Map

### Public Routes

- `/` -> marketing homepage
- `/demo` -> public intake demo
- `/book-demo` -> demo request form
- `/pricing`
- `/hackathon`
- `/login`

### Protected Routes

- `/dashboard`
- `/intake`
- `/clients`
- `/devices`
- `/journey/:patientId`

## Important Pages

### `src/pages/Home.jsx`

Purpose:

- public marketing landing page
- top-of-funnel positioning
- CTA entry into demo and book-demo flow

### `src/pages/BookDemo.jsx`

Purpose:

- capture demo requests
- submit leads to backend
- show customer-facing success state

### `src/pages/Intake.jsx`

Purpose:

- guided intake and session setup
- can run in practitioner mode or public demo mode

Special behavior:

- `publicMode` changes messaging and removes practitioner-only client selection behavior from the public demo experience

### `src/pages/Dashboard.jsx`

Purpose:

- practitioner analytics
- recovery trends
- protocol effectiveness
- patient status overview

### `src/pages/Journey.jsx`

Purpose:

- patient-facing recovery summary
- check-in, streak, XP, home routine, session history
- stronger recovery feedback based on actual stored sessions

## Shared Shell

### `src/components/AppChrome.jsx`

Provides:

- brand lockup
- page shell
- protected navigation tabs

Behavior:

- public pages do not show protected nav
- protected pages do

## State Management

### `src/context/AppContext.jsx`

Responsible for:

- loading patients
- creating clients
- updating scores
- persisting sessions
- storing MQTT auth token/base URL

## Data Services

### `src/services/appData.js`

Responsible for:

- fetch clients
- create client
- persist score
- persist session

### `src/services/marketing.js`

Responsible for:

- submit lead
- track marketing event

### `src/services/api.js`

Responsible for:

- AI summary calls
- TTS helpers

## Frontend Conventions

- public acquisition logic belongs on public pages
- practitioner operations belong behind protected routes
- patient/client creation remains an internal app action
- customer-facing text should never expose implementation details like SQLite, SMTP, or backend fallbacks

## Suggested Future Frontend Improvements

- code split major routes
- centralize analytics events
- add admin-facing leads page
- add explicit onboarding summary banner in the demo flow
- convert mock auth to real practitioner auth
