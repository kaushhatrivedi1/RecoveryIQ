# Marketing Funnel Documentation

## Goal

The marketing layer should bring qualified practitioners/clinics into the product without mixing public acquisition data with patient records.

## Funnel Structure

### 1. Homepage

Route:

- `/`

Purpose:

- communicate value clearly
- direct users into demo or demo booking

Primary CTA:

- `Try Demo Intake`

Secondary CTA:

- `Book Live Demo`

### 2. Public Demo

Route:

- `/demo`

Purpose:

- let a prospect experience the core workflow
- show intake, capture, and recovery planning without requiring auth

Important:

- this is a demo mode, not a real practitioner workspace

### 3. Book Demo

Route:

- `/book-demo`

Purpose:

- capture qualified interest
- store lead in backend
- trigger optional email notification

## Data Separation

### Lead

A lead is a prospect.

Fields:

- name
- email
- clinic
- role
- source
- interest
- notes

### Client / Patient

A client is a real patient record inside the practitioner product.

These must stay separate.

## Tracked Events

Current examples:

- `landing_page_view`
- `clicked_try_demo`
- `clicked_book_demo`
- `book_demo_page_view`
- `submitted_book_demo`
- `demo_page_view`

## Messaging Principle

The public funnel should sell outcomes, not internals.

Good:

- faster intake
- clearer movement insight
- better session setup

Bad:

- internal backend details
- SQLite/SMTP/implementation notes
- vague AI-heavy buzzwords

## Recommended Next Steps

- add a protected leads page
- add source filtering/reporting
- add CRM forwarding
- add email sequence or webhook automation
- add a real demo video/GIF above the fold on the homepage
