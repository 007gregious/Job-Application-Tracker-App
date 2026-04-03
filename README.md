# JobTrackr — Job Application Tracker

JobTrackr is a full-stack-ready job search companion for tracking applications, moving them through interview stages, and reviewing progress with analytics.

The current app experience includes:
- A React frontend with local account/session handling.
- LocalStorage-based application persistence for day-to-day usage.
- An Express + PostgreSQL API layer (already scaffolded) for server-backed deployments.

---

## ✨ What’s in the App Now

### Authentication & user session
- Sign up and sign in flows.
- Session persistence in browser storage.
- Signed-in header state with user name and sign out.

### Application management
- Create, edit, and delete job applications.
- Track rich details per application:
  - Company, role, location, salary, job type.
  - Applied date, contact person/email, job URL, notes.
  - Rejection reason (required when marking as rejected).
- Expandable application cards for quick view + detailed info.

### Status pipeline & progress
- Supported statuses:
  - Applied
  - Interview
  - Technical Test
  - Offer
  - Accepted
  - Rejected
  - Withdrawn
- One-click status progression chips for non-terminal stages.
- Visual progress bar per application.

### Dashboard & analytics
- Top-level stat cards (total, pending, interviews, rejected).
- Recent applications preview.
- Recharts-powered analytics:
  - Monthly trend area chart.
  - Status distribution pie chart.
  - Pipeline conversion bar chart.

### Productivity features
- Search and status filters in application list.
- Date sorting toggle.
- Excel export (`.xlsx`) of filtered applications.
- Toast notifications for key actions.

---

## 🧱 Tech Stack

### Frontend
- React 18
- React Hooks + Context API
- Recharts
- react-hot-toast
- react-icons
- date-fns
- xlsx + file-saver
- uuid

### Backend (included in repository)
- Node.js + Express
- PostgreSQL (`pg`) for production mode
- In-memory DB fallback for local API development
- dotenv

### Deployment
- Render blueprint included (`render.yaml`) with:
  - Web service config
  - PostgreSQL database config
  - Health check support (`/health`)

---

## 🚀 Getting Started

## 1) Install dependencies

```bash
npm install
```

## 2) Run the app

### Recommended (single server entry)

```bash
npm start
```

- Starts Express server (`server.js`).
- In production, serves the React build.
- In development, this runs API server mode.

### Frontend + API in parallel (development)

```bash
npm run dev
```

- API server: `npm run server` (port 3001 by default)
- React dev server: `npm run client` (port 3000)

---

## 🗄️ Data behavior (important)

- **Frontend currently persists applications in LocalStorage** (`job_applications`).
- **Auth data is also LocalStorage-based** (`jobtrackr_users`, `jobtrackr_current_user`).
- An API service (`/api/applications`) and SQL schema are present for server-backed persistence workflows.

This means you can run and use the app immediately without provisioning a database for core UI flows.

---

## 🔌 API Endpoints (Express)

Base path: `/api`

- `GET /api/test` — API health test
- `GET /api/applications?userId=<id>` — fetch user applications
- `POST /api/applications` — create application
- `PUT /api/applications/:id` — update application
- `DELETE /api/applications/:id` — delete application
- `GET /api/stats/:userId` — aggregated status counts
- `POST /api/applications/:id/packet` — save or update apply packet details (fit score, resume version, cover letter, answers, autofill URL)
- `POST /api/jobs/import` — store imported job opportunities before application creation
- `POST /api/applications/:id/ready` — move an application into the Ready-to-Apply queue (with readiness/duplicate checks)
- `POST /api/applications/:id/queue` — move application through assisted auto-apply queue (`draft`, `ready`, `paused`, `submitted`)
- `GET /api/queue?userId=<id>&status=ready` — fetch queue items by status
- `POST /api/applications/:id/submitted` — confirm submission, apply guardrails, and mark queue status as `submitted`
- `GET /health` — deployment health endpoint

---

## 🤖 Assisted Auto-Apply Workflow (new)

This project now includes a backend-ready, no-background-worker auto-apply flow designed for free-tier hosting:

1. Create an application as usual.
2. Save an **apply packet** (`/api/applications/:id/packet`) with resume version, cover letter, short-answer JSON, and rule-based fit/readiness scores.
3. Move the application to queue status `ready` (`/api/applications/:id/ready` or `/api/applications/:id/queue`).
4. Fetch queue items from `/api/queue?userId=<id>&status=ready` for extension/UI processing.
5. After the user finishes an external form, confirm with `/api/applications/:id/submitted`.

This keeps automation assistive and user-controlled while minimizing always-on server workloads.

---

## 🗃️ Database setup (optional for API-backed mode)

Schema file: `database.sql`

Setup script:

```bash
npm run db:setup
```

> Note: database setup requires `DATABASE_URL` and a live PostgreSQL connection available to the Node process.

---

## 📁 Project Structure

```text
src/
  components/
    applications/
    auth/
    common/
    dashboard/
    export/
  hooks/
  services/
  styles/
  utils/
routes/
server.js
render.yaml
database.sql
```

---

## 📌 Scripts

- `npm start` — run server entry
- `npm run client` — start React dev server
- `npm run server` — start Express API server
- `npm run dev` — run server + client concurrently
- `npm run build` — create production React build
- `npm test` — run tests
- `npm run db:setup` — execute SQL schema setup

---

## 🤝 Contributing

Contributions, issues, and enhancement ideas are welcome.

## 📄 License

MIT
