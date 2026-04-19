# Backend Guide

## Stack

- FastAPI
- MediaPipe
- OpenCV
- NumPy
- SciPy
- SQLite

Main file:

- `backend/main.py`

## Responsibilities

The backend currently handles:

- speech analysis
- pose analysis
- movement analysis
- rPPG/video analysis
- full assessment synthesis
- TTS audio generation
- client persistence
- recovery score persistence
- session persistence
- marketing lead capture
- marketing event tracking
- optional email notifications for new leads

## Persistence

SQLite database:

- `backend/recoveryiq.db`

Tables:

- `clients`
- `leads`
- `marketing_events`

## Initialization

The database bootstrap happens in:

- `init_client_store()`

This function:

- creates necessary tables
- seeds demo clients when empty
- backfills missing demo sessions/scores for legacy rows

## AI / Analysis Logic

### Speech Analysis

Endpoint:

- `/api/analyze-speech`

Flow:

1. parse transcript
2. extract zones/duration/behavior/discomfort by keywords
3. optionally use Claude if configured
4. return structured intake JSON

### Pose / Movement

Endpoints:

- `/api/analyze-pose`
- `/api/analyze-movement`

Used by the intake workflow to:

- estimate ROM
- score movement quality
- identify simple findings

### Video Analysis

Endpoints:

- `/api/analyze-video`
- `/api/full-assessment`

Used for:

- biometrics
- aggregate report generation

## Marketing Notification Flow

Lead creation endpoint:

- `/api/leads`

Behavior:

1. stores lead in SQLite
2. attempts to send notification email if SMTP is configured
3. returns lead data plus notification status

Email notification is best-effort and does not block storage.

## SMTP Configuration

Required env vars:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `LEAD_NOTIFY_TO`

If these are missing, lead storage still works and email is skipped.

## Recommended Backend Improvements

- add practitioner account table/auth
- add leads listing endpoint for internal dashboard use
- add retryable background notification queue
- add webhook integrations for Slack/CRM
- normalize session/report/intake schemas into separate tables instead of JSON blobs
