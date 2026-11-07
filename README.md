# Medslot: Clinic Appointment Booker (frontend)

A front-desk web app for a small clinic. Staff log in, see the day's appointments, book new ones
against live availability, and cancel or complete them. It talks to the Django REST API in the
separate backend repo (see the bottom of this file).

## Quick start: run both apps

Clone both repos side by side:

```bash
git clone https://github.com/AbbasAli4ever/medslot-backend.git backend
git clone https://github.com/AbbasAli4ever/medslot-frontend.git frontend
```

**First time only**

```bash
# backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

**Every time**, in two terminals:

```bash
# Terminal 1: backend, http://localhost:8000
cd backend
source .venv/bin/activate
python manage.py runserver 8000
```

```bash
# Terminal 2: frontend, http://localhost:3000
cd frontend
npm run dev
```

Then open:

- App: http://localhost:3000 (click **Continue with demo account**, or log in with `staff@medslot.app` / `medslot123`)
- Swagger: http://localhost:8000/api/docs/ (call `POST /api/auth/login/`, then click **Authorize** and paste the token)

**Troubleshooting**

- "Port already in use": stop the old process with `lsof -ti tcp:8000 | xargs kill` (backend) or `lsof -ti tcp:3000 | xargs kill` (frontend).
- To clear all appointments, restart the backend (Ctrl+C, then `runserver` again). Data is kept in memory only.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · motion (animations) · clsx

## Setup

The backend must be running first (default `http://localhost:8000`).

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
npm run dev                  # http://localhost:3000
```

Demo login: `staff@medslot.app` / `medslot123` (or click "Continue with demo account" on the login page).

### Run with Docker

The frontend ships a `Dockerfile` (multi-stage on `node:24-alpine`, runs `next start` on port 3000
as the non-root `node` user). The easiest way to run both apps is the backend repo's
`docker-compose.yml`, which builds this folder as the `web` service. Clone the two repos side by side
(`backend/` and `frontend/`) and run, from the backend repo:

```bash
docker compose up --build    # Web: http://localhost:3000   API: http://localhost:8000/api/docs/
```

Set `FRONTEND_DIR=/path/to/frontend` if the frontend lives somewhere else. To build this image on its
own:

```bash
docker build -t medslot-web --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api .
docker run -p 3000:3000 medslot-web
```

`NEXT_PUBLIC_API_BASE_URL` is baked into the browser bundle at build time, so it must be a URL the
browser can reach (the default is `http://localhost:8000/api`).

## Features

- **Login page**: staff sign-in. A session guard sends you to `/login` if the token is missing or
  expired, and any later 401 from the API logs you out.
- **Appointments table**: filters by doctor, date and status, plus a debounced patient name/phone
  search. Cancel (with an inline confirmation) and complete, for booked appointments only.
- **Pagination**: server-side pages with a "Showing 11–20 of 34" footer, compact page numbers and a
  rows-per-page select (10/20/50). Phones get a Prev / Next bar. The list goes back to page 1 when a
  filter changes, and falls back to the last page if the current one stops existing (for example
  after cancelling the last row of the last page under a status filter).
- **Doctor's day**: a second view that shows one doctor's day as 16 half-hour slot pills, in the same
  style as the booking drawer's times. Free pills open the booking flow prefilled with that doctor,
  day and time. Booked pills show the patient's first name and open their details (a 60-minute visit
  appears on both of its pills), completed ones are neutral, and past ones are greyed out. It has a
  compact free/booked/past strip and a "closed on Sundays" state.
- **Date picker**: every date control opens the same calendar (a popover on desktop, a bottom sheet
  on phones). Nothing accepts a typed date. Filters can pick past days, and Sundays are disabled.
- **Account menu**: an avatar menu in the header with the signed-in user and Log out.
- **Dropdowns**: no native selects. Doctor, page size and duration use one `Dropdown` (listbox with
  keyboard support and type-ahead), with portraits for doctors. It is a popover on desktop and a
  bottom sheet on phones.
- **Booking drawer**: doctor picker, calendar, live free slots for the chosen doctor and day, patient
  fields, and client-side validation. The server's error messages are shown per field.
- **Mobile layout**: a date-grouped appointment list, bottom sheets, and a 4-step booking flow
  (doctor, time, details, confirm).
- **States**: loading skeletons, error alerts with retry, empty states, and toasts.
- **Animations**: drawer and sheet transitions, step slides, status changes, and a highlight on the
  appointment you just booked.
- **Accessibility**: the drawer and sheets move focus in, trap Tab, close on Escape and restore focus.
- **Images**: the doctor portraits and illustrations in `public/illustrations/` were made with an AI image tool.
- **Docker**: a multi-stage `Dockerfile`, used by the backend repo's compose file (see above).

## Project structure

```
src/
  app/              layout, dashboard page (/), login page (/login), icon
  components/       dashboard, table, filters, row actions, booking drawer, calendar, slots
    ui/             primitives: Button, Drawer, BottomSheet, Dropdown, Field, Skeleton, ...
    mobile/         mobile list, day strip, slot list, stepped booking flow
    doctor-day/     doctor's day view: controls, summary, timeline
    login/          login form and showcase panel
    brand/          Medslot logo
  hooks/            useFetch, useClinicData, useBookingForm, useDialog, usePopover, useSession, ...
  lib/              api.ts (typed client and error handling), types, date helpers, auth, session
public/illustrations/  AI-generated portraits and illustrations
```

## Status

**Done:** everything in the feature list, working against the real API with both the desktop and mobile layouts.
All 7 bonus items are done (the backend README lists the same set):

- [x] Staff login: a login page, a session guard and an avatar menu with Log out
- [x] Pagination of the appointments list (desktop footer, phone Prev / Next bar)
- [x] Search by patient name or phone (debounced)
- [x] Tests: the backend has API tests (the frontend has none, see below)
- [x] Doctor's day timeline view, with booking from a free slot
- [x] Docker: a `Dockerfile` here and `docker-compose.yml` in the backend repo
- [x] Swagger / OpenAPI docs, served by the backend and linked from the login page

**Known gaps:**
- No automated frontend tests. The backend has API tests, but the UI was tested by hand.
- The auth token is stored in `localStorage`, not in an httpOnly cookie, which leaves it exposed to XSS.
- The mobile layout was checked in a narrow browser frame, not on a real device.
- Data is lost whenever the backend restarts, because its store is in-memory by design.

**With more time I would add:**
- Component and end-to-end tests (Testing Library and Playwright) for booking and status changes.
- Cookie-based sessions, set by the backend.
- Edit / reschedule appointments (the spec only allows status changes; today: cancel and re-book).
- Real-device QA on iOS and Android.

## Related

Backend (Django REST API) lives in a separate repo: https://github.com/AbbasAli4ever/medslot-backend
