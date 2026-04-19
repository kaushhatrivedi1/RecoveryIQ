# Deployment Notes

## Frontend

Build:

```bash
npm run build
```

Output:

- `dist/`

Important note:

- current frontend bundle is large and should be code-split later

## Backend

Syntax check:

```bash
python3 -m py_compile backend/main.py
```

Run locally:

```bash
cd backend
bash start.sh
```

## Required Runtime Pieces

### Frontend-only local demo

Works, but:

- camera scoring may fall back
- biometrics may fall back
- AI may fall back

### Full local experience

Requires:

- frontend dev server
- backend FastAPI server
- optional Claude key
- optional SMTP config

## Environment Variables

### Frontend

- `VITE_CLAUDE_KEY`
- `VITE_ELEVEN_KEY`
- `VITE_MQTT_BASE`

### Backend

- `CLAUDE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `LEAD_NOTIFY_TO`

## Restart Requirements

Restart backend when:

- changing SMTP settings
- changing Claude env vars
- changing database bootstrap behavior

Restart frontend when:

- changing Vite env vars

## Recommended Production Improvements

- move SQLite to managed Postgres
- add background worker for notifications
- add proper auth/session layer
- add secrets management
- add Sentry/logging
- add HTTPS and CORS tightening
