# API Reference

Base local backend URL:

- `http://localhost:8000`

## Health

### `GET /health`

Returns backend health and version metadata.

## Analysis Endpoints

### `POST /api/analyze-speech`

Input:

```json
{
  "transcript": "Area: lower back. Discomfort: 5 out of 10. Pattern: Comes and Goes. Duration: Less than 6 weeks. Notes: worse with sitting.",
  "patient_name": "Annie"
}
```

Returns:

- zones
- discomfort
- behavior
- duration
- notes
- summary

### `POST /api/detect-sign`

Single frame sign/gesture classification.

### `POST /api/analyze-pose`

Single frame pose analysis.

### `POST /api/analyze-movement`

Multi-frame motion analysis.

### `POST /api/analyze-video`

Multi-frame biometric analysis.

### `POST /api/full-assessment`

Combines movement/video/intake data for full report generation.

## Client Endpoints

### `GET /api/clients`

Optional query:

- `q`

Example:

`/api/clients?q=maria`

### `POST /api/clients`

Input:

```json
{
  "name": "New Client",
  "age": 36,
  "condition": "Lower Back Recovery"
}
```

### `POST /api/clients/{client_id}/scores`

Input:

```json
{
  "score": 72,
  "check_in": "great",
  "streak": 4,
  "xp": 140
}
```

### `POST /api/clients/{client_id}/sessions`

Input:

```json
{
  "protocol": "Mobility Surge",
  "duration": 7,
  "zones": ["lower_back"],
  "before_score": 64,
  "after_score": 68
}
```

## Marketing Endpoints

### `POST /api/leads`

Input:

```json
{
  "name": "Kaushha",
  "email": "demo@example.com",
  "clinic": "Recovery Lab",
  "role": "Founder",
  "source": "website",
  "interest": "clinic demo",
  "notes": "Interested in intake + movement capture"
}
```

Returns:

- `lead`
- `notification`

The notification object indicates whether SMTP email was sent.

### `POST /api/events`

Input:

```json
{
  "event": "clicked_try_demo",
  "path": "/",
  "source": "homepage_hero",
  "meta": {
    "source": "homepage_hero"
  }
}
```

## TTS Endpoint

### `POST /api/tts`

Input:

```json
{
  "text": "Welcome to RecoveryIQ."
}
```

Returns:

- WAV audio file response

## Hydrawav3 Device API

The actual device control is not served by this local FastAPI backend.

It is handled through the Hydrawav3 API:

- login endpoint for JWT
- MQTT publish endpoint for commands

Frontend helpers:

- `src/services/hydrawav.js`

Refer to the hackathon resource page and in-repo code for command payload details.
