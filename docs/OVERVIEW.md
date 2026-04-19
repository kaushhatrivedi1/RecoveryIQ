# RecoveryIQ Overview

## Product Summary

RecoveryIQ is a practitioner-facing recovery workflow app built around:

- structured intake
- voice-guided intake assistance
- camera-based movement capture
- biometric scan collection
- AI-assisted recovery/session planning
- patient journey and score tracking
- Hydrawav3 device session control

It also now includes a lightweight public marketing funnel:

- public homepage
- public demo intake route
- demo booking form
- lead capture and marketing event tracking

## Main User Types

### 1. Public Visitor

A public visitor can:

- view the homepage
- try the public product demo
- submit a book-demo request

A public visitor should not create real clinic patients.

### 2. Practitioner

A practitioner can:

- log in
- create/select clients
- run intake
- generate plans
- launch sessions
- review dashboard and journey views

### 3. Client / Patient

A client is the end patient record inside the practitioner workspace.

Client records contain:

- demographics/basic identity
- sessions
- recovery scores
- intake-derived workflow data

## Core Product Flows

### Practitioner Flow

`Login -> Dashboard -> Intake -> Guided Assessment -> Session Plan -> Live Session -> Journey`

### Public Marketing Flow

`Homepage -> Demo -> Book Demo -> Lead stored + optional email notification`

## Data Layers

### Frontend State

Managed mainly through:

- `src/context/AppContext.jsx`
- local route state and component state

### Backend Persistence

Persisted in SQLite:

- clients
- leads
- marketing events

Database file:

- `backend/recoveryiq.db`

## Key Strengths in the Current Build

- one product flow now serves both internal practitioner and public demo needs
- backend persistence is present for client/session/score/lead data
- movement capture and intake are connected to downstream session planning
- marketing funnel is now code-backed instead of static

## Current Known Constraints

- no full practitioner account system beyond mock login
- no CRM integration yet
- email follow-up depends on SMTP env configuration
- large frontend bundle should be split later
- some flows still use graceful fallbacks when AI/backend services are unavailable
