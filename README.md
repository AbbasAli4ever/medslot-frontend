# Medslot: Clinic Appointment Booker (frontend)

A front-desk web app for a small clinic. Staff log in, see the day's appointments, book new ones
against live availability, and cancel or complete them. It talks to the Django REST API in the
separate backend repo (see the bottom of this file).

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

## Features

- **Login page**: staff sign-in. A session guard sends you to `/login` if the token is missing or
  expired, and any later 401 from the API logs you out.
- **Appointments table**: filters by doctor, date and status, plus a debounced patient name/phone
  search. Cancel (with an inline confirmation) and complete, for booked appointments only.
- **Booking drawer**: doctor picker, calendar, live free slots for the chosen doctor and day, patient
  fields, and client-side validation. The server's error messages are shown per field.
- **Mobile layout**: a date-grouped appointment list, bottom sheets, and a 4-step booking flow
  (doctor, time, details, confirm).
- **States**: loading skeletons, error alerts with retry, empty states, and toasts.
- **Animations**: drawer and sheet transitions, step slides, status changes, and a highlight on the
  appointment you just booked.
- **Accessibility**: the drawer and sheets move focus in, trap Tab, close on Escape and restore focus.
- **Images**: the doctor portraits and illustrations in `public/illustrations/` were made with an AI image tool.

## Project structure

```
src/
  app/              layout, dashboard page (/), login page (/login), icon
  components/       dashboard, table, filters, row actions, booking drawer, calendar, slots
    ui/             primitives: Button, Drawer, BottomSheet, Field, Select, Skeleton, ...
    mobile/         mobile list, day strip, slot list, stepped booking flow
    login/          login form and showcase panel
    brand/          Medslot logo
  hooks/            useFetch, useClinicData, useBookingForm, useDialog, useSession, ...
  lib/              api.ts (typed client and error handling), types, date helpers, auth, session
public/illustrations/  AI-generated portraits and illustrations
```

## Status

**Done:** everything in the feature list, working against the real API with both the desktop and mobile layouts.

**Known gaps:**
- No automated frontend tests. The backend has API tests, but the UI was tested by hand.
- The auth token is stored in `localStorage`, not in an httpOnly cookie, which leaves it exposed to XSS.
- The mobile layout was checked in a narrow browser frame, not on a real device.
- Data is lost whenever the backend restarts, because its store is in-memory by design.

**With more time I would add:**
- Component and end-to-end tests (Testing Library and Playwright) for booking and status changes.
- Cookie-based sessions, set by the backend.
- Edit / reschedule appointments (the spec only allows status changes; today: cancel and re-book).
- Pagination or virtualisation for long lists, and real-device QA on iOS and Android.

## Related

Backend (Django REST API): separate repository, `medslot-backend`.
