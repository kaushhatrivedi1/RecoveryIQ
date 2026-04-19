# HYDRAWAV3™ — Practitioner Portal Prototype

A high-fidelity frontend prototype of the Hydrawav3 practitioner web application. Built to closely match the visual design, layout, and UX flow of the live product at `www.hydrawav3.studio`.

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4** with custom design tokens
- **Framer Motion** for transitions
- **lucide-react** for icons

## Features

### Pages
| Route | Description |
|---|---|
| `/dashboard` | Overview with quick actions and practice analytics |
| `/session` | Session Manager with client mode segmented control |
| `/session/guided-assessment` | Full 4-step AI-guided assessment flow |
| `/clients` | Client records table with search and actions |
| `/devices` | Hardware fleet management |
| `/login` | Authentication screen |

### Guided Assessment Flow
A complete 4-step wizard:
1. **Focus Area** — Select treatment goals (pain, recovery, mobility, etc.)
2. **Symptom Assessment** — Sliders for pain/mobility/inflammation, side selection, onset duration
3. **Recommended Protocol** — AI-generated config cards + confidence score
4. **Review & Start** — Summary with success animation

### Design System
All design tokens are in `src/app/globals.css`:
- `--sidebar-bg: #1a2d35` (dark teal)
- `--bg-main: #f5f0ea` (warm off-white)
- `--accent-tan: #c9a87c` (active states)
- `--accent-copper: #b87c5a` (CTAs)

## Getting Started

```bash
cd hydrawav3
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard`.

## File Structure

```
src/
├── app/
│   ├── globals.css         # Design tokens + Tailwind
│   ├── layout.tsx
│   ├── page.tsx            # Redirects to /dashboard
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── session/
│   │   ├── page.tsx                         # Session Manager
│   │   └── guided-assessment/page.tsx       # 4-step flow
│   ├── clients/page.tsx
│   └── devices/page.tsx
├── components/
│   └── layout/
│       ├── AppShell.tsx    # Root layout wrapper
│       ├── SidebarNav.tsx  # Left navigation
│       └── TopHeader.tsx   # Top bar with user menu
└── lib/
    ├── mockData.ts         # All demo data
    └── utils.ts            # cn() helper
```

## Notes
- No backend — purely frontend prototype with mock data
- Any credentials on the login page will redirect to the dashboard
- All pages use the shared `AppShell` for consistent layout
